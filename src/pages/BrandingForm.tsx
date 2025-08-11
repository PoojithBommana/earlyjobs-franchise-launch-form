
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Palette, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { brandingFormSchema, BrandingFormData } from '@/types/branding-form';
import { submitBrandingForm } from '@/utils/branding-submission';

const BrandingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      localPrintingPreference: false,
    },
  });

  const onSubmit = async (data: BrandingFormData) => {
    setIsSubmitting(true);
    console.log('Submitting branding form with data:', data);
    
    try {
      // Validate the form data
      const validatedData = brandingFormSchema.parse(data);
      console.log('Form validation passed:', validatedData);
      
      await submitBrandingForm(validatedData);
      setIsSubmitted(true);
      toast({
        title: "Form Submitted Successfully!",
        description: "Your branding form has been submitted to franchise@earlyjobs.in",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Form Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your branding form has been successfully submitted. Our team will process your request within 3 business days.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className='text-center' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="/early-jobs-logo.png" style={{ height: "150px", width: "150px", marginLeft: "10px" }} />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              EARLYJOBS FRANCHISE BRANDING & ONBOARDING KIT – DISPATCH FORM
            </h1>
            <p className="text-lg text-gray-600">
              To be submitted within 3 days of agreement signing. All fields are mandatory unless specified.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section A: Franchise Identification & Shipping Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Franchise Identification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="franchiseOwnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Owner Name (As per Registration)</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Business Name </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="franchiseLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Location (City & District) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number for Delivery Contact *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alternateMobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternate Mobile Number </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* <FormField
                    control={form.control}
                    name="preferredWorkingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Working Hours for Delivery (Office Timing) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 9:00 AM - 6:00 PM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </CardContent>
              </Card>

              {/* Section B: Office Branding Setup Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Office Branding Setup Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="officeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
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

                  <div>
                    <FormField
                      control={form.control}
                      name="frontageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Frontage Type *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="wall" id="wall" />
                                <Label htmlFor="wall">Wall</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="glass" id="glass" />
                                <Label htmlFor="glass">Glass</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="shutter" id="shutter" />
                                <Label htmlFor="shutter">Shutter</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="frontage-other" />
                                <Label htmlFor="frontage-other">Other</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('frontageType') === 'other' && (
                      <FormField
                        control={form.control}
                        name="frontageTypeOther"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input {...field} placeholder="Please specify" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Available Area for Exterior Flex (in feet) *</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="flexLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (ft)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="flexHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (ft)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Space for Indoor Standee (in feet) *</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="standeeLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (ft)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="standeeDepth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Depth (ft)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="wallColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wall Color (Interior) *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="white" id="white" />
                                <Label htmlFor="white">White</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="lightBlue" id="lightBlue" />
                                <Label htmlFor="lightBlue">Light Blue</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="wall-other" />
                                <Label htmlFor="wall-other">Other</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('wallColor') === 'other' && (
                      <FormField
                        control={form.control}
                        name="wallColorOther"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input {...field} placeholder="Please specify wall color" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="mountingSurface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surface for Mounting Posters/Boards *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nails" id="nails" />
                              <Label htmlFor="nails">Nails Available</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hooks" id="hooks" />
                              <Label htmlFor="hooks">Hooks</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tape" id="tape" />
                              <Label htmlFor="tape">Tape/Foam Mount</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Section C: Brand Personalization Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Personalization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ownerNameForCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Franchise Owner's Name (for Certificate) *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation for Visiting Card *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="managingPartner" id="managingPartner" />
                                <Label htmlFor="managingPartner">Managing Partner</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="director" id="director" />
                                <Label htmlFor="director">Director</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="designation-other" />
                                <Label htmlFor="designation-other">Other</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('designation') === 'other' && (
                      <FormField
                        control={form.control}
                        name="designationOther"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input {...field} placeholder="Please specify designation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameOnVisitingCard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name to Appear on Visiting Card *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobileOnVisitingCard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number to Appear on Visiting Card *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="regionalLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regional Language Preferred for Posters (Posters will be printed in this language + English) *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="tamil">Tamil</SelectItem>
                                <SelectItem value="kannada">Kannada</SelectItem>
                                <SelectItem value="telugu">Telugu</SelectItem>
                                <SelectItem value="gujarati">Gujarati</SelectItem>
                                <SelectItem value="bengali">Bengali</SelectItem>
                                <SelectItem value="marathi">Marathi</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('regionalLanguage') === 'other' && (
                      <FormField
                        control={form.control}
                        name="regionalLanguageOther"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input {...field} placeholder="Please specify language" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Branded T-Shirt Sizes (any two) *</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tshirtSize1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size 1</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="S">S</SelectItem>
                                  <SelectItem value="M">M</SelectItem>
                                  <SelectItem value="L">L</SelectItem>
                                  <SelectItem value="XL">XL</SelectItem>
                                  <SelectItem value="XXL">XXL</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tshirtSize2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size 2</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="S">S</SelectItem>
                                  <SelectItem value="M">M</SelectItem>
                                  <SelectItem value="L">L</SelectItem>
                                  <SelectItem value="XL">XL</SelectItem>
                                  <SelectItem value="XXL">XXL</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section D: Optional Local Print Support */}
              {/* <Card>
                <CardHeader>
                  <CardTitle> Optional (Local Print Support)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="localPrintingPreference"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Yes, I will arrange printing locally using the EarlyJobs design file
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('localPrintingPreference') && (
                    <FormField
                      control={form.control}
                      name="fileFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File format preference *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PDF" id="PDF" />
                                <Label htmlFor="PDF">PDF</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Corel" id="Corel" />
                                <Label htmlFor="Corel">Corel</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="AI" id="AI" />
                                <Label htmlFor="AI">AI</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PNG" id="PNG" />
                                <Label htmlFor="PNG">PNG</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card> */}

              {/* Form Submission Details */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Form Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="submissionDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
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
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
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
                          <FormLabel>Franchise Owner Signature *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Type your full name as signature" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                    <p><strong>Submit via:</strong> franchise@earlyjobs.in or directly to your Franchise Success Manager</p>
                  </div>
                </CardContent>
              </Card> */}

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 text-lg" style={{ backgroundColor: "orange" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Branding Form'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BrandingForm;
