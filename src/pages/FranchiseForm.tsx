// FranchiseForm.jsx

// Add global declarations for Google Picker and gapi
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Building, Users, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Define a schema for each document to conditionally validate the driveLink
const documentSchema = z.object({
  status: z.enum(['submitted', 'pending']),
  driveLink: z.string().optional(), // Allow empty strings, validate URL format later
}).refine(
  (data) => {
    if (data.status === 'submitted') {
      return true; // No driveLink needed for submitted status
    }
    if (data.status === 'pending' && !data.driveLink) {
      return false; // Require driveLink if pending and empty
    }
    if (data.status === 'pending' && data.driveLink) {
      // Validate URL format only if driveLink is non-empty
      const urlRegex = /^https?:\/\/(www\.)?drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view\?usp=sharing$/;
      return urlRegex.test(data.driveLink);
    }
    return true;
  },
  {
    message: 'A valid Google Drive shareable link is required when status is pending (e.g., https://drive.google.com/file/d/{fileId}/view?usp=sharing)',
    path: ['driveLink'],
  }
);

const formSchema = z.object({
  franchiseeName: z.string().min(2, 'Full name is required'),
  businessName: z.string().optional(),
  franchiseLocation: z.string().min(2, 'Location is required'),
  openingDate: z.date({ required_error: 'Opening date is required' }),
  officeAddress: z.string().min(10, 'Complete address is required'),
  officeArea: z.enum(['250-300', '300-400', 'other']),
  customArea: z.string().optional(),
  setupType: z.enum(['owned', 'rented', 'coworking']),
  infrastructure: z.object({
    internet: z.boolean(),
    electricity: z.boolean(),
    desks: z.boolean(),
    cctv: z.boolean(),
    branding: z.boolean(),
  }),
  spocName: z.string().min(2, 'SPOC name is required'),
  spocMobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile number required'),
  spocEmail: z.string().email('Valid email required'),
  alternateContact: z.string().optional(),
  documents: z.object({
    aadhaarPan: documentSchema,
    photograph: documentSchema,
    businessReg: documentSchema,
    cheque: documentSchema,
    rental: documentSchema,
    electricity: documentSchema,
    background: documentSchema,
    agreement: documentSchema,
    fdd: documentSchema,
    panCopy: documentSchema,
    secondaryId: documentSchema,
  }),
  readinessConfirm: z.enum(['yes', 'not-yet']),
  notReadyReason: z.string().optional(),
  declaration: z.boolean().refine(val => val === true, 'Declaration must be accepted'),
  submissionDate: z.date({ required_error: 'Submission date is required' }),
  signature: z.string().min(2, 'Signature is required'),
}).refine(
  (data) => data.officeArea !== 'other' || (data.officeArea === 'other' && data.customArea && data.customArea.length > 0),
  {
    message: 'Custom area must be specified when "Other" is selected',
    path: ['customArea'],
  }
).refine(
  (data) => data.readinessConfirm !== 'not-yet' || (data.readinessConfirm === 'not-yet' && data.notReadyReason && data.notReadyReason.length > 0),
  {
    message: 'Reason must be provided when not ready',
    path: ['notReadyReason'],
  }
);

type FormData = z.infer<typeof formSchema>;

/**
 * Loads the Google Picker API and opens the picker dialog.
 * @param options Picker options and callback.
 * @param toast Toast function to display errors.
 */
function openPicker(
  options: {
    clientId: string;
    developerKey: string;
    viewId?: string;
    showUploadView?: boolean;
    showUploadFolders?: boolean;
    supportDrives?: boolean;
    multiselect?: boolean;
    callbackFunction: (data: any) => void;
  },
  toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => void
) {
  // Ensure Google API scripts are loaded
  function loadGoogleApis() {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi && window.google && window.google.picker) {
        resolve();
      } else {
        const script1 = document.createElement('script');
        script1.src = 'https://apis.google.com/js/api.js';
        script1.async = true;
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://accounts.google.com/gsi/client';
          script2.async = true;
          script2.onload = () => resolve();
          script2.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
          document.body.appendChild(script2);
        };
        script1.onerror = () => reject(new Error('Failed to load Google API script'));
        document.body.appendChild(script1);
      }
    });
  }

  // Initialize gapi and authenticate
  function initializeGapiAndAuthenticate() {
    return new Promise<string>((resolve, reject) => {
      window.gapi.load('client:picker', {
        callback: () => {
          // Initialize Google Identity Services
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: options.clientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (response: any) => {
              if (response.error) {
                reject(new Error(`Authentication failed: ${response.error}`));
              } else {
                resolve(response.access_token);
              }
            },
          });

          // Request an access token
          tokenClient.requestAccessToken({ prompt: '' });
        },
      });
    });
  }

  // Create and show the picker
  function createPicker(oauthToken: string) {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId[options.viewId || 'DOCS'])
      .setIncludeFolders(true)
      .setSelectFolderEnabled(!!options.showUploadFolders);

    let pickerBuilder = new window.google.picker.PickerBuilder()
      .setAppId(options.clientId.split('-')[0])
      .setOAuthToken(oauthToken)
      .setDeveloperKey(options.developerKey)
      .addView(view)
      .setCallback(options.callbackFunction);

    if (options.showUploadView) {
      pickerBuilder = pickerBuilder.addView(new window.google.picker.DocsUploadView());
    }
    if (options.multiselect) {
      pickerBuilder = pickerBuilder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }
    if (options.supportDrives) {
      pickerBuilder = pickerBuilder.enableFeature(window.google.picker.Feature.SUPPORT_DRIVES);
    }

    pickerBuilder.build().setVisible(true);
  }

  // Main execution flow
  loadGoogleApis()
    .then(() => initializeGapiAndAuthenticate())
    .then((oauthToken) => createPicker(oauthToken))
    .catch((error) => {
      toast({
        title: 'Error',
        description: `Failed to initialize Google Picker: ${error.message}`,
        variant: 'destructive',
      });
    });
}

const FranchiseForm = () => {
  const { toast } = useToast();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      infrastructure: {
        internet: false,
        electricity: false,
        desks: false,
        cctv: false,
        branding: false,
      },
      documents: {
        aadhaarPan: { status: 'pending', driveLink: '' },
        photograph: { status: 'pending', driveLink: '' },
        businessReg: { status: 'pending', driveLink: '' },
        cheque: { status: 'pending', driveLink: '' },
        rental: { status: 'pending', driveLink: '' },
        electricity: { status: 'pending', driveLink: '' },
        background: { status: 'pending', driveLink: '' },
        agreement: { status: 'pending', driveLink: '' },
        fdd: { status: 'pending', driveLink: '' },
        panCopy: { status: 'pending', driveLink: '' },
        secondaryId: { status: 'pending', driveLink: '' },
      },
      declaration: false,
    },
  });

  const submitToGoogleSheets = useCallback(async (data: Record<string, any>) => {
    console.log('Submitting data to Google Sheets:', data);

    const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/tz2ek2232veh1';
    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const formattedIST = format(istTime, "EEE, MMMM dd, yyyy, hh:mm a 'IST'");

      const transformedData = {
        "Franchisee Name": data.franchiseeName,
        "Business Name": data.businessName || "",
        "Franchise Location": data.franchiseLocation,
        "Opening Date": data.openingDate ? format(data.openingDate, 'MM/dd/yyyy') : '',
        "Office Address": data.officeAddress,
        "Office Area": data.officeArea === 'other' ? data.customArea || "Not specified" : data.officeArea,
        "Setup Type": data.setupType,
        "Infrastructure [JSON]": JSON.stringify(data.infrastructure),
        "SPOC Name": data.spocName,
        "SPOC Mobile": data.spocMobile,
        "SPOC Email": data.spocEmail,
        "Alternate Contact": data.alternateContact || "",
        "Documents Status [JSON]": JSON.stringify(data.documents),
        "Readiness Confirmation": data.readinessConfirm,
        "Not Ready Reason": data.notReadyReason || "",
        "Submission Date": data.submissionDate ? format(data.submissionDate, 'MM/dd/yyyy') : '',
        "Signature": data.signature,
        "Additional Info 1": "",
        "Additional Info 2": "",
        "Form Filled At": formattedIST,
        "Aadhaar/PAN of Owner": data.documents.aadhaarPan.status === 'pending' ? (data.documents.aadhaarPan.driveLink || "Not provided") : "Submitted",
        "Passport-size Photograph": data.documents.photograph.status === 'pending' ? (data.documents.photograph.driveLink || "Not provided") : "Submitted",
        "Business Registration (GST/Udyam)": data.documents.businessReg.status === 'pending' ? (data.documents.businessReg.driveLink || "Not provided") : "Submitted",
        "Cancelled Cheque/Passbook Copy": data.documents.cheque.status === 'pending' ? (data.documents.cheque.driveLink || "Not provided") : "Submitted",
        "Rental Agreement or Property Proof": data.documents.rental.status === 'pending' ? (data.documents.rental.driveLink || "Not provided") : "Submitted",
        "Latest Electricity Bill": data.documents.electricity.status === 'pending' ? (data.documents.electricity.driveLink || "Not provided") : "Submitted",
        "Background Clearance Declaration": data.documents.background.status === 'pending' ? (data.documents.background.driveLink || "Not provided") : "Submitted",
        "Signed Franchise Agreement": data.documents.agreement.status === 'pending' ? (data.documents.agreement.driveLink || "Not provided") : "Submitted",
        "Signed FDD Acknowledgement": data.documents.fdd.status === 'pending' ? (data.documents.fdd.driveLink || "Not provided") : "Submitted",
        "PAN Card Copy": data.documents.panCopy.status === 'pending' ? (data.documents.panCopy.driveLink || "Not provided") : "Submitted",
        "Secondary ID (DL/Passport/Voter ID)": data.documents.secondaryId.status === 'pending' ? (data.documents.secondaryId.driveLink || "Not provided") : "Submitted",
      };

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [transformedData] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Submission failed: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Google Sheets submission error:', error);
      throw error instanceof Error ? error : new Error('Failed to submit to Google Sheets');
    }
  }, []);

  const onSubmit = useCallback(async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitToGoogleSheets(data);
      if (!result.success) {
        throw new Error('Submission failed');
      }

      setShowSuccessMessage(true);
      form.reset();
      toast({
        title: "Form Submitted Successfully!",
        description: "Your franchise activation form has been submitted.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, toast, submitToGoogleSheets]);

  const onError = useCallback((errors: any) => {
    console.error('Form validation errors:', errors);
    toast({
      title: "Validation Error",
      description: "Please check the form for errors and fill all required fields.",
      variant: "destructive",
    });
  }, [toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  type DocumentKey =
    | 'Aadhaar/PAN of Owner'
    | 'Passport-size Photograph'
    | 'Business Registration (GST/Udyam)'
    | 'Cancelled Cheque/Passbook Copy'
    | 'Rental Agreement or Property Proof'
    | 'Latest Electricity Bill'
    | 'Background Clearance Declaration'
    | 'Signed Franchise Agreement'
    | 'Signed FDD Acknowledgement'
    | 'PAN Card Copy'
    | 'Secondary ID (DL/Passport/Voter ID)';

  const documentsList: { key: DocumentKey; label: string }[] = [
    { key: 'Aadhaar/PAN of Owner', label: 'Aadhaar/PAN of Owner' },
    { key: 'Passport-size Photograph', label: 'Passport-size Photograph' },
    { key: 'Business Registration (GST/Udyam)', label: 'Business Registration (GST/Udyam)' },
    { key: 'Cancelled Cheque/Passbook Copy', label: 'Cancelled Cheque/Passbook Copy' },
    { key: 'Rental Agreement or Property Proof', label: 'Rental Agreement or Property Proof' },
    { key: 'Latest Electricity Bill', label: 'Latest Electricity Bill' },
    { key: 'Background Clearance Declaration', label: 'Background Clearance Declaration' },
    { key: 'Signed Franchise Agreement', label: 'Signed Franchise Agreement' },
    { key: 'Signed FDD Acknowledgement', label: 'Signed FDD Acknowledgement' },
    { key: 'PAN Card Copy', label: 'PAN Card Copy' },
    { key: 'Secondary ID (DL/Passport/Voter ID)', label: 'Secondary ID (DL/Passport/Voter ID)' },
  ];

  const documentKeyMap: Record<DocumentKey, keyof FormData['documents']> = {
    'Aadhaar/PAN of Owner': 'aadhaarPan',
    'Passport-size Photograph': 'photograph',
    'Business Registration (GST/Udyam)': 'businessReg',
    'Cancelled Cheque/Passbook Copy': 'cheque',
    'Rental Agreement or Property Proof': 'rental',
    'Latest Electricity Bill': 'electricity',
    'Background Clearance Declaration': 'background',
    'Signed Franchise Agreement': 'agreement',
    'Signed FDD Acknowledgement': 'fdd',
    'PAN Card Copy': 'panCopy',
    'Secondary ID (DL/Passport/Voter ID)': 'secondaryId',
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              Your franchise activation form has been successfully submitted.
            </p>
            <Button onClick={() => setShowSuccessMessage(false)} className="w-full">
              Submit Another Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Earlyjobs Franchise Activation
          </h1>
          <p className="text-lg text-gray-600">
            Franchise Launch Readiness Confirmation Form
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please complete this form at least 7 days before your official launch
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Section A: Franchise Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="franchiseeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchisee Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Business Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="franchiseLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Location (District/City) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="openingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Opening Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Section B: Office Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="officeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Address *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter complete office address with pincode"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="officeArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Area *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="250-300" id="area1" />
                              <Label htmlFor="area1">250–300 sq ft</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="300-400" id="area2" />
                              <Label htmlFor="area2">300–400 sq ft</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="area3" />
                              <Label htmlFor="area3">Other</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('officeArea') === 'other' && (
                    <FormField
                      control={form.control}
                      name="customArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Area</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter area in sq ft" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="setupType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Setup Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="owned" id="owned" />
                              <Label htmlFor="owned">Owned</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rented" id="rented" />
                              <Label htmlFor="rented">Rented</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="coworking" id="coworking" />
                              <Label htmlFor="coworking">Co-working</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold mb-4 block">Office Infrastructure</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'internet', label: 'Internet active' },
                      { key: 'electricity', label: 'Electricity connection active' },
                      { key: 'desks', label: '2–3 Desks' },
                      { key: 'cctv', label: 'CCTV installed (optional)' },
                      { key: 'branding', label: 'Branding displayed (poster/flex)' },
                    ].map((item) => (
                      <FormField
                        key={item.key}
                        control={form.control}
                        name={`infrastructure.${item.key}` as `infrastructure.${keyof FormData['infrastructure']}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Section C: SPOC & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="spocName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SPOC name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spocMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Mobile *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10-digit mobile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spocEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="alternateContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Name & Mobile (e.g., John Doe - 9876543210)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Section D: Documents Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-xs">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Document</th>
                        <th className="border px-2 py-1">Status</th>
                        <th className="border px-2 py-1">Google Drive Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentsList.map((doc) => {
                        const schemaKey = documentKeyMap[doc.key];
                        return (
                          <tr key={doc.key}>
                            <td className="border px-2 py-1">{doc.label}</td>
                            <td className="border px-2 py-1">
                              <FormField
                                control={form.control}
                                name={`documents.${schemaKey}.status`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          if (value === 'submitted') {
                                            form.setValue(`documents.${schemaKey}.driveLink`, '');
                                          }
                                        }}
                                        value={field.value}
                                        className="flex justify-center space-x-4"
                                      >
                                        <div className="flex items-center space-x-1">
                                          <RadioGroupItem value="submitted" id={`${doc.key}-submitted`} />
                                          <Label htmlFor={`${doc.key}-submitted`} className="text-xs">Submitted</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <RadioGroupItem value="pending" id={`${doc.key}-pending`} />
                                          <Label htmlFor={`${doc.key}-pending`} className="text-xs">Pending</Label>
                                        </div>
                                      </RadioGroup>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="border px-2 py-1">
                              {form.watch(`documents.${schemaKey}.status`) === 'pending' && (
                                <FormField
                                  control={form.control}
                                  name={`documents.${schemaKey}.driveLink`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            openPicker(
                                              {
                                                clientId: "124195828012-nsgud3uee4fovodbpr6132pj4t14fgct.apps.googleusercontent.com",
                                                developerKey: "AIzaSyD91U-yC_Zak67WzYvwAFWUvzpJCyltPiA",
                                                viewId: "DOCS",
                                                showUploadView: true,
                                                showUploadFolders: true,
                                                supportDrives: true,
                                                multiselect: false,
                                                callbackFunction: (data) => {
                                                  if (data.action === 'picked' && data.docs?.[0]) {
                                                    const fileId = data.docs[0].id;
                                                    // Use the token from the picker authentication
                                                    fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=permissions`, {
                                                      headers: {
                                                        Authorization: `Bearer ${data.oauthToken || window.google.accounts.oauth2.getAccessToken()}`,
                                                      },
                                                    })
                                                      .then((res) => res.json())
                                                      .then((fileData) => {
                                                        const isShared = fileData.permissions?.some(
                                                          (perm) => perm.type === 'anyone' && perm.role !== 'private'
                                                        );

                                                        const shareableLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
                                                        console.log("fileId:", fileId);
                                                        if (!isShared) {
                                                          fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                                                            method: 'POST',
                                                            headers: {
                                                              Authorization: `Bearer ${data.oauthToken || window.google.accounts.oauth2.getAccessToken()}`,
                                                              'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                              role: 'reader',
                                                              type: 'anyone',
                                                            }),
                                                          })
                                                            .then(() => {
                                                              form.setValue(`documents.${schemaKey}.driveLink`, shareableLink, {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                              });
                                                              toast({
                                                                title: "File Selected",
                                                                description: "File permissions updated and link added.",
                                                              });
                                                            })
                                                            .catch((error) => {
                                                              toast({
                                                                title: "Permission Error",
                                                                description: `Failed to set file permissions: ${error.message}`,
                                                                variant: "destructive",
                                                              });
                                                            });
                                                        } else {
                                                          form.setValue(`documents.${schemaKey}.driveLink`, shareableLink, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                          });
                                                          toast({
                                                            title: "File Selected",
                                                            description: "Shareable link added to the form.",
                                                          });
                                                        }
                                                      })
                                                      .catch((error) => {
                                                        toast({
                                                          title: "Drive Error",
                                                          description: `Failed to fetch permissions: ${error.message}`,
                                                          variant: "destructive",
                                                        });
                                                      });
                                                  }
                                                },
                                              },
                                              toast
                                            );
                                          }}
                                          className="text-xs"
                                        >
                                          Select from Drive
                                        </Button>
                                      </FormControl>
                                      {field.value && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          <a href={field.value} target="_blank" rel="noopener noreferrer">
                                            View Selected File
                                          </a>
                                        </div>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>* Click "Select from Drive" to choose a file from Google Drive. A shareable link will be added automatically.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Section E: Final Declarations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="readinessConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I confirm my readiness to launch *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="ready-yes" />
                            <Label htmlFor="ready-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-yet" id="ready-no" />
                            <Label htmlFor="ready-no">Not Yet</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch('readinessConfirm') === 'not-yet' && (
                  <FormField
                    control={form.control}
                    name="notReadyReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for not being ready</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please explain why you're not ready to launch"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="declaration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        I declare that all the information provided in this form is true and accurate to the best of my knowledge *
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Submission *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature of Franchisee *</FormLabel>
                        <FormControl>
                          <Input placeholder="Type your full name as signature" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting to Earlyjobs...
                  </>
                ) : (
                  'Submit to Earlyjobs'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FranchiseForm;
