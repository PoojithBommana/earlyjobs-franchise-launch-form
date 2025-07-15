import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Camera, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PhotoUploadField } from '@/components/PhotoUploadField';
import { photoSubmissionSchema, PhotoSubmissionFormData } from '@/types/photo-submission-form';
import { submitPhotoFormToGoogleSheets } from '@/utils/photo-submission';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PhotoSubmissionForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhotoSubmissionFormData>({
    resolver: zodResolver(photoSubmissionSchema),
    defaultValues: {
      Full_Name: '',
      Franchise_District: '',
      Office_Address: '',
      Branding_Complete: undefined,
      Additional_Notes: '',
      Declaration_Confirmed: false,
      Branding_Elements_Count: '',
    },
  });

  const onSubmit = async (data: PhotoSubmissionFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting photo form submission with data:', data);

      // Submit using the proper photo submission function
      const result = await submitPhotoFormToGoogleSheets(data);
      
      if (result.success) {
        toast.success('Photo submission form submitted successfully!');
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-600">
                Your photo submission form has been successfully submitted.
              </p>
              <Link to="/">
                <Button className="w-full">Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/early-jobs-logo.png" alt="EarlyJobs Logo" className="h-20 w-20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📋 EarlyJobs – Franchise Branding Photo Submission Form
          </h1>
          <p className="text-lg text-gray-600">
            Submit photos of your completed branding setup for verification and listings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Basic Franchise Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ SECTION 1: Basic Franchise Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="Full_Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Who's filling this form?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Franchise_District"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Franchise District Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your district/city name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Office_Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Full Address <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="For Google My Business listing. Include landmark and PIN code."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Branding_Completion_Date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Branding Completion <span className="text-red-500">*</span></FormLabel>
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
                                <span>When was the branding setup finished?</span>
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
                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section 2: Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  📸 SECTION 2: Photo Upload (Checklist-Based)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Upload high-quality photos in JPG/PNG format. Images will be automatically compressed for optimal upload.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="Front_View_Photo"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        candidateId={form.watch('Full_Name') || 'Default'}
                        label="Front View of Office with Signboard"
                        required
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <p className="text-xs text-gray-500">Wide view of your office from outside.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Reception_Photo"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Reception Area or Entrance"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        candidateId={form.watch('Full_Name') || 'Default'}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Workstations_Photo"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        candidateId={form.watch('Full_Name') || 'Default'}
                        label="Workstations or Inside Office View"
                        required
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Meeting_Space_Photo"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Meeting or Interview Space"
                        value={field.value}
                        onChange={field.onChange}
                        candidateId={form.watch('Full_Name') || 'Default'}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Branding_Elements_Count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Branding Elements (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="How many branding elements are installed?"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">Count of flex boards, door stickers, logo walls, etc.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Team_Photo"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Team Photo"
                        value={field.value}
                        onChange={field.onChange}
                        candidateId={form.watch('Full_Name') || 'Default'}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            {/* Section 3: Confirmation & Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧾 SECTION 3: Confirmation & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="Branding_Complete"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Was all branding done as per the checklist? <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <label htmlFor="yes">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <label htmlFor="no">No</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Additional_Notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mention anything unusual, pending, or helpful."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Declaration_Confirmed"
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
                          Declaration <span className="text-red-500">*</span>
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          ☑ I confirm the above photos are accurate and current, and I authorize EarlyJobs to use them for verification, listings, and brand communication.
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Photo Form'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PhotoSubmissionForm;