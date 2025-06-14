import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Building, Users, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { FormData } from '@/types/franchise-form';
import { formSchema } from '@/types/franchise-form';
import { submitToGoogleSheets } from '@/utils/form-submission';
import SuccessMessage from '@/components/SuccessMessage';
import type { FieldErrors } from 'react-hook-form';
import { documentKeyMap } from '@/constants/franchise-form';

type FileLink = { url: string; name: string };

const documentsList = [
  { key: 'aadhaar', label: 'Aadhaar Card (Front & Back)', dualUpload: true },
  { key: 'pan', label: 'PAN Card', dualUpload: false },
  { key: 'photograph', label: 'Passport Size Photograph', dualUpload: false },
  { key: 'businessReg', label: 'Business Registration Certificate', dualUpload: false },
  { key: 'cheque', label: 'Cancelled Cheque', dualUpload: false },
  { key: 'rental', label: 'Rental Agreement', dualUpload: false },
  { key: 'electricity', label: 'Latest Electricity Bill', dualUpload: false },
  // { key: 'background', label: 'Background Verification Report', dualUpload: false },
  { key: 'agreement', label: 'Signed Franchise Agreement', dualUpload: false },
  { key: 'panCopy', label: 'Business PAN ( If sole proprietor)', dualUpload: false },
  { key: 'secondaryId', label: 'GST Certificate (Mandatory)', dualUpload: false },
];

const DocumentsChecklist = () => {
  const { toast } = useToast();
  const form = useFormContext<FormData>();
  const [fileLinks, setFileLinks] = useState<Record<string, { front?: FileLink; back?: FileLink }>>({});
  const [loading, setLoading] = useState<Record<string, { front?: boolean; back?: boolean }>>({});
  const API_URL = import.meta.env.VITE_API_URL;
  const uploadEndpoint = `${API_URL}/api/franchise/upload`;

  const handleUploadClick = useCallback(
    (key: string, side?: 'front' | 'back') => {
      const input = document.createElement('input');
      if (form.getValues('franchiseeName')) {
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = async (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              setLoading((prev) => ({
                ...prev,
                [key]: { ...prev[key], [side ?? 'front']: true },
              }));
              const formData = new FormData();
              formData.append('file', file);
              formData.append('userId', form.getValues('franchiseeName') || 'franchiseeName');
              formData.append('key', `${key}${side ? `_${side}` : ''}`);

              const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
              }

              const result = await response.json();
              console.log('File upload result:', key, side);

              const mappedKey = documentKeyMap[key as keyof typeof documentKeyMap];
              console.log('mappedKey:', mappedKey);
              const fieldKey = side ? `documents.${mappedKey}.${side}` : `documents.${mappedKey}.driveLink`;
              form.setValue(fieldKey as any, result.webViewLink);
              form.setValue(`documents.${mappedKey}.status` as any, 'submitted');

              setFileLinks((prev) => ({
                ...prev,
                [key]: {
                  ...prev[key],
                  [side ?? 'front']: { url: result.webViewLink, name: file.name },
                },
              }));
            } catch (error) {
              console.error('File upload error:', error);
              form.setValue(`documents.${documentKeyMap[key as keyof typeof documentKeyMap]}.status` as any, 'error');
              toast({
                title: 'Upload Failed',
                description: 'Failed to upload the file. Please try again.',
                variant: 'destructive',
              });
            } finally {
              setLoading((prev) => ({
                ...prev,
                [key]: { ...prev[key], [side ?? 'front']: false },
              }));
            }
          }
        };
        input.click();
      } else {
        toast({
          title: 'Your Full Name is Required',
          description: 'Please enter your Full Name before uploading documents.',
          variant: 'destructive',
        });
        window.scrollTo(0, 0);
      }
    },
    [form, toast]
  );

  const handleCancelUpload = useCallback(
    (key: string, side?: 'front' | 'back') => {
      const mappedKey = documentKeyMap[key as keyof typeof documentKeyMap];
      const fieldKey = side ? `documents.${mappedKey}.${side}` : `documents.${mappedKey}.driveLink`;
      form.setValue(fieldKey as any, '');
      form.setValue(`documents.${mappedKey}.status` as any, 'pending');
      setFileLinks((prev) => {
        const newLinks = { ...prev };
        if (side) {
          newLinks[key] = { ...newLinks[key], [side]: undefined };
        } else {
          newLinks[key] = {};
        }
        return newLinks;
      });
    },
    [form]
  );

  useEffect(() => {
    return () => {
      Object.values(fileLinks).forEach(({ front, back }) => {
        if (front?.url) URL.revokeObjectURL(front.url);
        if (back?.url) URL.revokeObjectURL(back.url);
      });
    };
  }, [fileLinks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Documents Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentsList.map(({ key, label, dualUpload }) => (
          <FormField
            key={key}
            control={form.control}
            name={dualUpload ? `documents.${documentKeyMap[key]}.front` : `documents.${documentKeyMap[key]}.driveLink`}
            render={({ field }) => (
              <FormItem style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <FormLabel className="text-base font-medium">
                    {label} {dualUpload || (key !== 'panCopy') ? '*' : '(Optional)'}
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-4 sm:mt-3">
                      {dualUpload ? (
                        <>
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(key, 'front')}
                              disabled={loading[key]?.front}
                              className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors"
                            >
                              {loading[key]?.front ? (
                                <span className="animate-pulse">Uploading Front...</span>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  Upload Front
                                </>
                              )}
                            </Button>
                            {fileLinks[key]?.front && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <a href={fileLinks[key].front?.url} target="_blank" rel="noopener noreferrer">
                                  {fileLinks[key].front?.name}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelUpload(key, 'front')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(key, 'back')}
                              disabled={loading[key]?.back}
                              className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors"
                            >
                              {loading[key]?.back ? (
                                <span className="animate-pulse">Uploading Back...</span>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  Upload Back
                                </>
                              )}
                            </Button>
                            {fileLinks[key]?.back && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <a href={fileLinks[key].back?.url} target="_blank" rel="noopener noreferrer">
                                  {fileLinks[key].back?.name}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelUpload(key, 'back')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUploadClick(key)}
                          disabled={loading[key]?.front}
                          className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors mt-0 sm:mt-5"
                        >
                          {loading[key]?.front ? (
                            <span className="animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </FormControl>
                </div>
                {!dualUpload && fileLinks[key]?.front && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                    <a href={fileLinks[key].front?.url} target="_blank" rel="noopener noreferrer">
                      View uploaded file: {fileLinks[key].front?.name}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelUpload(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {form.getValues(`documents.${documentKeyMap[key]}.status` as any) === 'error' && (
                  <div className="text-sm text-red-500 mt-2">Failed to process file</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
};



const FranchiseForm = () => {
  const { toast } = useToast();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      infrastructure: {
        electricity: false,
        desks: false,
        reception: false,
        interviewDesks: false,
        brandingSpace: false,
        broadband: false,
        laptops: false,
        printer: false,
        whiteboard: false,
        ups: false,
        washroom: false,
        drinkingWater: false,
        cctvCoverage: false,
        smartPhone: false,
      },
      documents: {
        aadhaar: { status: 'pending', front: '', back: '' },
        pan: { status: 'pending', driveLink: '' },
        photograph: { status: 'pending', driveLink: '' },
        businessReg: { status: 'pending', driveLink: '' },
        cheque: { status: 'pending', driveLink: '' },
        rental: { status: 'pending', driveLink: '' },
        electricity: { status: 'pending', driveLink: '' },
        // background: { status: 'pending', driveLink: '' },
        agreement: { status: 'pending', driveLink: '' },
        panCopy: { status: 'pending', driveLink: '' },
        secondaryId: { status: 'pending', driveLink: '' },
      },
      // declaration: false,
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      ownerEmail: '',
      permanentAddress: {
        street: '',
        town: '',
        city: '',
        state: '',
        pinCode: '',
        country: ''
      },
      currentAddress: {
        street: '',
        town: '',
        city: '',
        state: '',
        pinCode: '',
        country: ''
      },
      sameAsPermanent: false,
    },
  });

  const onSubmit = useCallback(async (data: FormData) => {
    console.log(data);
    setIsSubmitting(true);
    setError(null);

    const documentKeys = [
      'aadhaar',
      'pan',
      'photograph',
      'businessReg',
      'cheque',
      'rental',
      'electricity',
      'background',
      'agreement',
      'panCopy',
      'secondaryId',
    ];

    const missingDocuments = documentKeys.filter((key) => {
      // Safely check if the document exists first
      const doc = data.documents[key as keyof typeof data.documents];
      if (!doc) return true;

      // Special case for aadhaar which has front and back
      if (key === 'aadhaar') {
        return !('front' in doc && 'back' in doc && doc.front && doc.back);
      }

      // For all other documents, check driveLink
      return !doc.driveLink || doc.driveLink.trim() === '';
    }).filter(key => 
      // Filter out 'background' as it's commented out in your form
      key !== 'background' && 
      // Filter out optional documents (panCopy is optional)
      key !== 'panCopy'
    );

    console.log('Missing Documents:', missingDocuments);

    // Adjust the validation to exclude optional documents
    if (missingDocuments.length > 0) {
      setIsSubmitting(false);
      toast({
        title: "Missing Required Documents",
        description: "Please upload all required documents before submitting the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitToGoogleSheets(data);
      if (result.success) {
        setShowSuccessMessage(true);
        form.reset();
        toast({
          title: "Form Submission Successfully",
          description: "Your franchise application form has been submitted.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Submission error:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, toast]);

  const onError = useCallback((errors: any) => {
    console.error('Form validation error:', errors);
    toast({
      title: "Validation Error",
      description: "Please check the form for errors and upload all required documents.",
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

  useEffect(() => {
    if (form.watch('sameAsPermanent')) {
      form.setValue('currentAddress', form.getValues('permanentAddress'));
    }
  }, [form.watch('sameAsPermanent'), form]);

  if (showSuccessMessage) {
    return <SuccessMessage onNewForm={() => setShowSuccessMessage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="text-center" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="/early-jobs-logo.png" style={{ height: "150px", width: "150px", marginLeft: "10px" }} />
      </div>
      <div className="max-w-4xl mx-auto w-full">
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
            {/* Section A: Franchise Identification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-orange-600" />
                  Franchise Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="franchiseeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchisee Owner Full Name</FormLabel>
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
                        <FormLabel>Registered Business Name</FormLabel>
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
                        <FormLabel>Franchise Location (District/City)</FormLabel>
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
                        <FormLabel>Proposed Opening Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full text-left pl-3 font-normal",
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

            {/* Section B: Office Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Office Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="Building name, street name, and number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="townLocality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Town/Locality*</FormLabel>
                        <FormControl>
                          <Input placeholder="Neighborhood or local area name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input placeholder="City or municipality name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stateProvince"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province*</FormLabel>
                        <FormControl>
                          <Input placeholder="State or province name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code/ZIP Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code or ZIP code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country*</FormLabel>
                        <FormControl>
                          <Input placeholder="Country name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="officeArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Area*</FormLabel>
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
                          <FormLabel>Specify Area*</FormLabel>
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
                        <FormLabel>Office Setup Type*</FormLabel>
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
                  <Label className="text-base font-semibold mb-4 block">Office Infrastructure*</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      { key: 'electricity', label: 'Electricity connection active' },
                      { key: 'desks', label: '2–3 Desks' },
                      { key: 'reception', label: 'Reception (for walk-ins)' },
                      { key: 'interviewDesks', label: 'Interview desk x 2' },
                      { key: 'brandingSpace', label: 'Branding space for EarlyJobs wall' },
                      { key: 'broadband', label: 'Broadband, WiFi router' },
                      { key: 'laptops', label: 'Laptops x 2 for staff and 1 for assessments' },
                      { key: 'printer', label: 'Printer (Basic)' },
                      { key: 'whiteboard', label: 'Whiteboard for pipeline management / Notice Board' },
                      { key: 'ups', label: 'UPS or Power Backup' },
                      { key: 'washroom', label: 'Washroom within 500 M Radius' },
                      { key: 'drinkingWater', label: 'Drinking Water Facility' },
                      { key: 'cctvCoverage', label: '1 CCTV capturing the complete office and 1 outside' },
                      { key: 'smartPhone', label: 'Business Sim with WhatsApp' },
                    ] as const).map((item) => (
                      <FormField
                        key={item.key}
                        control={form.control}
                        name={`infrastructure.${item.key}` as
                          | "infrastructure.electricity"
                          | "infrastructure.desks"
                          | "infrastructure.reception"
                          | "infrastructure.interviewDesks"
                          | "infrastructure.brandingSpace"
                          | "infrastructure.broadband"
                          | "infrastructure.laptops"
                          | "infrastructure.printer"
                          | "infrastructure.whiteboard"
                          | "infrastructure.ups"
                          | "infrastructure.washroom"
                          | "infrastructure.drinkingWater"
                          | "infrastructure.cctvCoverage"
                          | "infrastructure.smartPhone"
                        }
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section C: SPOC & Communication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  SPOC & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="spocName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPOC Full Name</FormLabel>
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
                        <FormLabel>SPOC Mobile</FormLabel>
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
                        <FormLabel>SPOC Email</FormLabel>
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

            {/* Section D: Owner Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Owner Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ownerFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10-digit phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Permanent Address *</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="permanentAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress.town"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Town/Locality</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter town/locality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress.pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PIN code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FormField
                      control={form.control}
                      name="sameAsPermanent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Current address same as permanent address
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  {!form.watch('sameAsPermanent') && (
                    <div className="space-y-4">
                      <FormLabel className="text-base font-semibold">Current Address *</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currentAddress.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter street address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentAddress.town"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Town/Locality</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter town/locality" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentAddress.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentAddress.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentAddress.pinCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PIN Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter PIN code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentAddress.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section E: Documents Checklist */}
            <DocumentsChecklist />

            {/* Section F: Final Declarations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                  Final Declarations
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
                 
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
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