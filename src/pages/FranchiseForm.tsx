
import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Building, Users, CheckCircle, Loader2 } from 'lucide-react';
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
import { FormData, formSchema } from '@/types/franchise-form';
import { submitToGoogleSheets } from '@/utils/form-submission';
import DocumentsChecklist from '@/components/DocumentsChecklist';
import SuccessMessage from '@/components/SuccessMessage';

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
            <DocumentsChecklist form={form} />

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
