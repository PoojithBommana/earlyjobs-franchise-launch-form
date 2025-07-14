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
import { photoSubmissionSchema, PhotoSubmissionFormData, franchiseDistricts } from '@/types/photo-submission-form';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PhotoSubmissionForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PhotoSubmissionFormData>({
    resolver: zodResolver(photoSubmissionSchema),
    defaultValues: {
      fullName: '',
      franchiseDistrict: '',
      officeAddress: '',
      brandingAsPerChecklist: undefined,
      additionalNotes: '',
      declaration: false,
      brandingElements: [],
    },
  });

  const onSubmit = async (data: PhotoSubmissionFormData) => {
    setIsLoading(true);
    
    try {
      // Prepare data for submission
      const submissionData = {
        ...data,
        brandingCompletionDate: format(data.brandingCompletionDate, 'MM/dd/yyyy'),
        submissionDate: format(new Date(), 'MM/dd/yyyy'),
        formFilledAt: new Date().toLocaleString('en-US', {
          weekday: 'short',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
          timeZoneName: 'short'
        }),
        formType: 'Photo Submission',
        sheetTab: 'Photo Submissions'
      };

      // Submit to SheetDB API (same as other forms)
      const response = await fetch('https://sheetdb.io/api/v1/py99bvu81b75t', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [submissionData]
        }),
      });

      if (response.ok) {
        toast.success('Photo submission form submitted successfully!');
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit form. Please try again.');
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
                  name="fullName"
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
                  name="franchiseDistrict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Franchise District Name <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {franchiseDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="officeAddress"
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
                  name="brandingCompletionDate"
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
                  Upload high-quality photos in JPG/PNG format, max 10 MB per file.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="frontViewPhoto"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Front View of Office with Signboard"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Wide view of your office from outside.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receptionAreaPhoto"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Reception Area or Entrance"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Entry point of your center with branding visible.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workstationsPhoto"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Workstations or Inside Office View"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Show team desks, systems, or working space.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingSpacePhoto"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Meeting or Interview Space"
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Optional: conference/meeting setup.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandingElements"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Close-ups of Branding Elements"
                        multiple
                        maxFiles={3}
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Flex board, door sticker, logo wall poster (2-3 files allowed).</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamPhoto"
                  render={({ field }) => (
                    <FormItem>
                      <PhotoUploadField
                        label="Team Photo"
                        value={field.value}
                        onChange={field.onChange}
                        franchiseId="Franchise"
                      />
                      <p className="text-xs text-gray-500">Optional but preferred: Franchise owner + team, in t-shirts or by signage.</p>
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
                  name="brandingAsPerChecklist"
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
                  name="additionalNotes"
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
                  name="declaration"
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