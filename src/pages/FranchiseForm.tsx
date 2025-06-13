import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Building, Users, CheckCircle, Loader2, Upload } from 'lucide-react';
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
import type { FormData } from '@/types/franchise-form';
import { formSchema } from '@/types/franchise-form';
import { submitToGoogleSheets } from '@/utils/form-submission';
import SuccessMessage from '@/components/SuccessMessage';
import type { FieldErrors } from 'react-hook-form';

type FileLink = { url: string; name: string };

const DocumentsChecklist = ({ form }) => {
  const [fileLinks, setFileLinks] = useState<Record<string, FileLink>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const uploadEndpoint = `${API_URL}/api/franchise/upload`;

  const handleUploadClick = (key: string) => {
    const input = document.createElement('input');
    if (form.getValues('franchiseeName')) {
      input.type = 'file';
      input.accept = '.pdf,.jpg,.jpeg,.png';
      console.log("form.getValues('franchiseeName'):", form.getValues('franchiseeName'));
      input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            setLoading((prev) => ({ ...prev, [key]: true }));
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', form.getValues('franchiseeName') || 'franchiseeName');
            formData.append('key', key);

            const response = await fetch(uploadEndpoint, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`File uploaded for ${key}:`, result.webViewLink);

            form.setValue(`documents.${key}.driveLink`, result.webViewLink);
            form.setValue(`documents.${key}.status`, 'submitted');

            setFileLinks((prev) => ({
              ...prev,
              [key]: { url: result.webViewLink, name: file.name },
            }));
          } catch (error) {
            console.error('File upload error:', error);
            form.setValue(`documents.${key}.status`, 'pending');
            toast({
              title: "Upload Failed",
              description: "Failed to upload the file. Please try again.",
              variant: "destructive",
            });
          } finally {
            setLoading((prev) => ({ ...prev, [key]: false }));
          }
        }
      };
      input.click();
    } else {
      toast({
        title: "Your Full Name is Required",
        description: "Please enter your Full Name",
        variant: "destructive",
      });
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(fileLinks).forEach(({ url }) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [fileLinks]);

  useEffect(() => {
    console.log("DocumentsChecklist mounted with:", form.getValues());
  }, [form]);

  const documentFields = [
    { key: 'aadhaarPan', label: 'Aadhaar & PAN Card' },
    { key: 'photograph', label: 'Passport-size Photograph' },
    { key: 'businessReg', label: 'Business Registration' },
    { key: 'cheque', label: 'Cancelled Cheque' },
    { key: 'rental', label: 'Rental Agreement' },
    { key: 'electricity', label: 'Latest Electricity Bill' },
    { key: 'background', label: 'Background Verification' },
    { key: 'agreement', label: 'Franchise Agreement' },
    { key: 'fdd', label: 'FDD Document' },
    { key: 'panCopy', label: 'PAN Copy' },
    { key: 'secondaryId', label: 'Secondary ID' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Documents Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentFields.map(({ key, label }) => (
          <FormField
            key={key}
            control={form.control}
            name={`documents.${key}.status`}
            render={({ field }) => (
              <FormItem style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormLabel className="text-base font-medium">{label}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue(`documents.${key}.status`, value);
                        }}
                        value={field.value}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pending" id={`${key}-pending`} />
                          <Label htmlFor={`${key}-pending`} className="text-sm font-normal">
                            Pending
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="submitted" id={`${key}-submitted`} />
                          <Label htmlFor={`${key}-submitted`} className="text-sm font-normal">
                            Submitted
                          </Label>
                        </div>
                      </RadioGroup>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadClick(key)}
                        disabled={field.value === 'uploaded' || loading[key]}
                        className="flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        {loading[key] ? (
                          <>
                            <span className="animate-pulse">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </FormControl>
                </div>
                {fileLinks[key] && (
                  <div className="text-sm text-blue-600 mt-2">
                    <a href={fileLinks[key].url} target="_blank" rel="noopener noreferrer">
                      View uploaded file: {fileLinks[key].name}
                    </a>
                  </div>
                )}
                {form.getValues(`documents.${key}.status`) === 'error' && (
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
      console.log('Submission error:', errorMessage);
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

  const onError = useCallback((errors: FieldErrors<FormData>) => {
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

  if (showSuccessMessage) {
    return <SuccessMessage onNewForm={() => setShowSuccessMessage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="text-center" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="/early-jobs-logo.png" style={{ height: "150px", width: "150px", marginLeft: "10px" }} />
      </div>
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
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Office Readiness
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
                        name={
                          item.key === 'internet'
                            ? 'infrastructure.internet'
                            : item.key === 'electricity'
                              ? 'infrastructure.electricity'
                              : item.key === 'desks'
                                ? 'infrastructure.desks'
                                : item.key === 'cctv'
                                  ? 'infrastructure.cctv'
                                  : 'infrastructure.branding'
                        }
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
            <DocumentsChecklist form={form} />

            {/* Section E: Final Declarations */}
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