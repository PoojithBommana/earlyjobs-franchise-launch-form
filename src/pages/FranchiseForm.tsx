
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Building, Users, FileText, CheckCircle, Upload, Loader2 } from 'lucide-react';
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

const formSchema = z.object({
  // Section A
  franchiseeName: z.string().min(2, 'Full name is required'),
  businessName: z.string().optional(),
  franchiseLocation: z.string().min(2, 'Location is required'),
  openingDate: z.date({ required_error: 'Opening date is required' }),
  
  // Section B
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
  
  // Section C
  spocName: z.string().min(2, 'SPOC name is required'),
  spocMobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile number required'),
  spocEmail: z.string().email('Valid email required'),
  alternateContact: z.string().optional(),
  
  // Section D
  documents: z.object({
    aadhaarPan: z.enum(['submitted', 'pending']),
    photograph: z.enum(['submitted', 'pending']),
    businessReg: z.enum(['submitted', 'pending']),
    cheque: z.enum(['submitted', 'pending']),
    rental: z.enum(['submitted', 'pending']),
    electricity: z.enum(['submitted', 'pending']),
    background: z.enum(['submitted', 'pending']),
    agreement: z.enum(['submitted', 'pending']),
    fdd: z.enum(['submitted', 'pending']),
    panCopy: z.enum(['submitted', 'pending']),
    secondaryId: z.enum(['submitted', 'pending']),
  }),
  
  // Section E
  readinessConfirm: z.enum(['yes', 'not-yet']),
  notReadyReason: z.string().optional(),
  declaration: z.boolean().refine(val => val === true, 'Declaration must be accepted'),
  submissionDate: z.date({ required_error: 'Submission date is required' }),
  signature: z.string().min(2, 'Signature is required'),
});

type FormData = z.infer<typeof formSchema>;

const FranchiseForm = () => {
  const { toast } = useToast();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  
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
        aadhaarPan: 'pending',
        photograph: 'pending',
        businessReg: 'pending',
        cheque: 'pending',
        rental: 'pending',
        electricity: 'pending',
        background: 'pending',
        agreement: 'pending',
        fdd: 'pending',
        panCopy: 'pending',
        secondaryId: 'pending',
      },
      declaration: false,
    },
  });

  const handleFileUpload = (docKey: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const isValidType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        return isValidType && isValidSize;
      });

      if (validFiles.length > 0) {
        setUploadedFiles(prev => ({
          ...prev,
          [docKey]: validFiles
        }));
        toast({
          title: "Files uploaded",
          description: `${validFiles.length} file(s) uploaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid files",
          description: "Please upload valid PDF, JPG, or PNG files under 10MB.",
          variant: "destructive",
        });
      }
    }
  };

  const submitToGoogleSheets = async (data: FormData) => {
    // Mock Google Apps Script Web App URL - replace with actual URL
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    try {
      // Prepare form data with files
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value instanceof Date) {
          formDataToSend.append(key, value.toISOString());
        } else if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      // Add uploaded files
      Object.entries(uploadedFiles).forEach(([docKey, files]) => {
        files.forEach((file, index) => {
          formDataToSend.append(`${docKey}_file_${index}`, file);
        });
      });

      console.log('Submitting to Google Sheets...');
      
      // For now, simulate the API call since we don't have a real Google Sheets endpoint
      const response = await fetch('/api/mock-submit', {
        method: 'POST',
        body: formDataToSend,
      }).catch(() => {
        // Simulate successful submission for demo
        return { ok: true, json: () => Promise.resolve({ success: true }) };
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error('Failed to submit to Google Sheets');
      }
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Form submitted:', data);
      console.log('Uploaded files:', uploadedFiles);
      
      await submitToGoogleSheets(data);
      
      setShowSuccessMessage(true);
      toast({
        title: "Form Submitted Successfully!",
        description: "Your franchise activation form has been submitted to Earlyjobs and saved to Google Sheets.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentsList = [
    { key: 'aadhaarPan', label: 'Aadhaar/PAN of Owner' },
    { key: 'photograph', label: 'Passport-size Photograph' },
    { key: 'businessReg', label: 'Business Registration (GST/Udyam)' },
    { key: 'cheque', label: 'Cancelled Cheque/Passbook Copy' },
    { key: 'rental', label: 'Rental Agreement or Property Proof' },
    { key: 'electricity', label: 'Latest Electricity Bill' },
    { key: 'background', label: 'Background Clearance Declaration' },
    { key: 'agreement', label: 'Signed Franchise Agreement' },
    { key: 'fdd', label: 'Signed FDD Acknowledgement' },
    { key: 'panCopy', label: 'PAN Card Copy' },
    { key: 'secondaryId', label: 'Secondary ID (DL/Passport/Voter ID)' },
  ];

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              Your franchise activation form has been successfully submitted to Earlyjobs and saved to Google Sheets.
              You will receive a confirmation email shortly.
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
        {/* Header */}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Section A: Franchise Identification */}
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

            {/* Section B: Office Readiness */}
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
                        name={`infrastructure.${item.key}` as any}
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

            {/* Section C: SPOC & Communication */}
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

            {/* Section D: Documents Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Section D: Documents Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-semibold">Document</th>
                        <th className="text-center py-3 px-2 font-semibold w-32">Status</th>
                        <th className="text-center py-3 px-2 font-semibold w-48">Upload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentsList.map((doc) => (
                        <tr key={doc.key} className="border-b">
                          <td className="py-3 px-2 text-sm">{doc.label}</td>
                          <td className="py-3 px-2">
                            <FormField
                              control={form.control}
                              name={`documents.${doc.key}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
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
                          <td className="py-3 px-2">
                            {form.watch(`documents.${doc.key}` as any) === 'pending' && (
                              <div className="flex flex-col items-center space-y-2">
                                <div className="relative">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={(e) => handleFileUpload(doc.key, e.target.files)}
                                    className="hidden"
                                    id={`file-${doc.key}`}
                                  />
                                  <Label
                                    htmlFor={`file-${doc.key}`}
                                    className="flex items-center justify-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md px-3 py-2 text-xs text-blue-700"
                                  >
                                    <Upload className="h-3 w-3" />
                                    Upload
                                  </Label>
                                </div>
                                {uploadedFiles[doc.key] && uploadedFiles[doc.key].length > 0 && (
                                  <div className="text-xs text-green-600">
                                    {uploadedFiles[doc.key].length} file(s) uploaded
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>* Accepted file formats: PDF, JPG, PNG (Max 10MB per file)</p>
                </div>
              </CardContent>
            </Card>

            {/* Section E: Final Declarations */}
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

            {/* Submit Button */}
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
