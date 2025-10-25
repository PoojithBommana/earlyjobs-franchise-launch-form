import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitBrandingForm } from '@/utils/branding-submission';

interface BrandingFormData {
  franchiseOwnerName: string;
  businessName: string;
  franchiseLocation: string;
  shippingAddress: string;
  mobileNumber: string;
  alternateMobile: string;
  officeType: string;
  frontageType: string;
  frontageTypeOther: string;
  flexLength: string;
  flexHeight: string;
  standeeLength: string;
  standeeDepth: string;
  wallColor: string;
  wallColorOther: string;
  mountingSurface: string;
  ownerNameForCertificate: string;
  nameOnVisitingCard: string;
  mobileOnVisitingCard: string;
  regionalLanguage: string;
  regionalLanguageOther: string;
  tshirtSize1: string;
  tshirtSize2: string;
}

const BrandingForm = () => {
  const [formData, setFormData] = useState<BrandingFormData>({
    franchiseOwnerName: '',
    businessName: '',
    franchiseLocation: '',
    shippingAddress: '',
    mobileNumber: '',
    alternateMobile: '',
    officeType: '',
    frontageType: '',
    frontageTypeOther: '',
    flexLength: '',
    flexHeight: '',
    standeeLength: '',
    standeeDepth: '',
    wallColor: '',
    wallColorOther: '',
    mountingSurface: '',
    ownerNameForCertificate: '',
    nameOnVisitingCard: '',
    mobileOnVisitingCard: '',
    regionalLanguage: '',
    regionalLanguageOther: '',
    tshirtSize1: '',
    tshirtSize2: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BrandingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BrandingFormData, string>> = {};
    const requiredFields: (keyof BrandingFormData)[] = [
      'franchiseOwnerName',
      'businessName',
      'franchiseLocation',
      'shippingAddress',
      'mobileNumber',
      'officeType',
      'frontageType',
      'flexLength',
      'flexHeight',
      'standeeLength',
      'standeeDepth',
      'wallColor',
      'mountingSurface',
      'ownerNameForCertificate',
      'nameOnVisitingCard',
      'mobileOnVisitingCard',
      'regionalLanguage',
      'tshirtSize1',
      'tshirtSize2',
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });

    if (formData.frontageType === 'other' && !formData.frontageTypeOther) {
      newErrors.frontageTypeOther = 'Please specify frontage type';
    }
    if (formData.wallColor === 'other' && !formData.wallColorOther) {
      newErrors.wallColorOther = 'Please specify wall color';
    }
    if (formData.regionalLanguage === 'other' && !formData.regionalLanguageOther) {
      newErrors.regionalLanguageOther = 'Please specify regional language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: keyof BrandingFormData,
  ) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form data:', formData);

    try {
      // Explicitly construct submissionData to match BrandingFormData
      const submissionData: BrandingFormData = {
        franchiseOwnerName: formData.franchiseOwnerName,
        businessName: formData.businessName,
        franchiseLocation: formData.franchiseLocation,
        shippingAddress: formData.shippingAddress,
        mobileNumber: formData.mobileNumber,
        alternateMobile: formData.alternateMobile,
        officeType: formData.officeType,
        frontageType: formData.frontageType,
        frontageTypeOther: formData.frontageTypeOther,
        flexLength: formData.flexLength,
        flexHeight: formData.flexHeight,
        standeeLength: formData.standeeLength,
        standeeDepth: formData.standeeDepth,
        wallColor: formData.wallColor,
        wallColorOther: formData.wallColorOther,
        mountingSurface: formData.mountingSurface,
        ownerNameForCertificate: formData.ownerNameForCertificate,
        nameOnVisitingCard: formData.nameOnVisitingCard,
        mobileOnVisitingCard: formData.mobileOnVisitingCard,
        regionalLanguage: formData.regionalLanguage,
        regionalLanguageOther: formData.regionalLanguageOther,
        tshirtSize1: formData.tshirtSize1,
        tshirtSize2: formData.tshirtSize2,
      };
      // Attempt to submit with type assertion as a fallback
      await submitBrandingForm(submissionData as any); // Temporary fallback; replace with correct type
      setIsSubmitted(true);
      toast({
        title: 'Form Submitted Successfully!',
        description: 'Your branding form has been submitted to franchise@earlyjobs.in',
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
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
            <Button onClick={() => window.location.href = '/'}>Return to Portal</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/early-jobs-logo.png" style={{ height: '150px', width: '150px', marginLeft: '10px' }} alt="EarlyJobs Logo" />
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section A: Franchise Identification & Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle>Franchise Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Franchise Owner Name (As per Business Registration) *</Label>
                  <Input
                    value={formData.franchiseOwnerName}
                    onChange={(e) => handleChange(e, 'franchiseOwnerName')}
                    placeholder="Enter franchise owner name"
                  />
                  {errors.franchiseOwnerName && <p className="text-red-500 text-sm">{errors.franchiseOwnerName}</p>}
                </div>
                <div>
                  <Label>Business Name *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => handleChange(e, 'businessName')}
                    placeholder="Enter business name"
                  />
                  {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName}</p>}
                </div>
                <div>
                  <Label>Franchise Location (City & District) *</Label>
                  <Input
                    value={formData.franchiseLocation}
                    onChange={(e) => handleChange(e, 'franchiseLocation')}
                    placeholder="Enter city and district"
                  />
                  {errors.franchiseLocation && <p className="text-red-500 text-sm">{errors.franchiseLocation}</p>}
                </div>
                <div>
                  <Label>Franchise Address *</Label>
                  <Textarea
                    value={formData.shippingAddress}
                    onChange={(e) => handleChange(e, 'shippingAddress')}
                    rows={3}
                    placeholder="Enter shipping address"
                  />
                  {errors.shippingAddress && <p className="text-red-500 text-sm">{errors.shippingAddress}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mobile Number *</Label>
                    <Input
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange(e, 'mobileNumber')}
                      placeholder="Enter mobile number"
                    />
                    {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
                  </div>
                  <div>
                    <Label>Alternate Mobile Number</Label>
                    <Input
                      value={formData.alternateMobile}
                      onChange={(e) => handleChange(e, 'alternateMobile')}
                      placeholder="Enter alternate mobile number"
                    />
                    {errors.alternateMobile && <p className="text-red-500 text-sm">{errors.alternateMobile}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section B: Office Branding Setup Details */}
            <Card>
              <CardHeader>
                <CardTitle>Office Branding Setup Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-lg">Office Type *</Label>
                  <RadioGroup
                    value={formData.officeType}
                    onValueChange={(value) => handleChange(value, 'officeType')}
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
                      <Label htmlFor="coworking">
                        Co-working (Written confirmation from the co-working space for branding purposes needed)
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.officeType && <p className="text-red-500 text-sm">{errors.officeType}</p>}
                </div>
                <div>
                  <Label className="text-lg">Office Frontage Type *</Label>
                  <RadioGroup
                    value={formData.frontageType}
                    onValueChange={(value) => handleChange(value, 'frontageType')}
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
                  {errors.frontageType && <p className="text-red-500 text-sm">{errors.frontageType}</p>}
                  {formData.frontageType === 'other' && (
                    <div className="mt-2">
                      <Input
                        value={formData.frontageTypeOther}
                        onChange={(e) => handleChange(e, 'frontageTypeOther')}
                        placeholder="Please specify"
                      />
                      {errors.frontageTypeOther && <p className="text-red-500 text-sm">{errors.frontageTypeOther}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-3">Available Area for Exterior Flex (in feet) *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Length (ft)</Label>
                      <Input
                        type="number"
                        value={formData.flexLength}
                        onChange={(e) => handleChange(e, 'flexLength')}
                      />
                      {errors.flexLength && <p className="text-red-500 text-sm">{errors.flexLength}</p>}
                    </div>
                    <div>
                      <Label>Height (ft)</Label>
                      <Input
                        type="number"
                        value={formData.flexHeight}
                        onChange={(e) => handleChange(e, 'flexHeight')}
                      />
                      {errors.flexHeight && <p className="text-red-500 text-sm">{errors.flexHeight}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Space for Indoor Standee (in feet) *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Length (ft)</Label>
                      <Input
                        type="number"
                        value={formData.standeeLength}
                        onChange={(e) => handleChange(e, 'standeeLength')}
                      />
                      {errors.standeeLength && <p className="text-red-500 text-sm">{errors.standeeLength}</p>}
                    </div>
                    <div>
                      <Label>Depth (ft)</Label>
                      <Input
                        type="number"
                        value={formData.standeeDepth}
                        onChange={(e) => handleChange(e, 'standeeDepth')}
                      />
                      {errors.standeeDepth && <p className="text-red-500 text-sm">{errors.standeeDepth}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Wall Color (Interior) *</Label>
                  <RadioGroup
                    value={formData.wallColor}
                    onValueChange={(value) => handleChange(value, 'wallColor')}
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
                  {errors.wallColor && <p className="text-red-500 text-sm">{errors.wallColor}</p>}
                  {formData.wallColor === 'other' && (
                    <div className="mt-2">
                      <Input
                        value={formData.wallColorOther}
                        onChange={(e) => handleChange(e, 'wallColorOther')}
                        placeholder="Please specify wall color"
                      />
                      {errors.wallColorOther && <p className="text-red-500 text-sm">{errors.wallColorOther}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Surface for Mounting Posters/Boards *</Label>
                  <RadioGroup
                    value={formData.mountingSurface}
                    onValueChange={(value) => handleChange(value, 'mountingSurface')}
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
                  {errors.mountingSurface && <p className="text-red-500 text-sm">{errors.mountingSurface}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Section C: Brand Personalization Details */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Personalization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Franchise Owner's Name (for Certificate) *</Label>
                  <Input
                    value={formData.ownerNameForCertificate}
                    onChange={(e) => handleChange(e, 'ownerNameForCertificate')}
                    placeholder="Enter name for certificate"
                  />
                  {errors.ownerNameForCertificate && <p className="text-red-500 text-sm">{errors.ownerNameForCertificate}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name to Appear on Visiting Card *</Label>
                    <Input
                      value={formData.nameOnVisitingCard}
                      onChange={(e) => handleChange(e, 'nameOnVisitingCard')}
                      placeholder="Enter name for visiting card"
                    />
                    {errors.nameOnVisitingCard && <p className="text-red-500 text-sm">{errors.nameOnVisitingCard}</p>}
                  </div>
                  <div>
                    <Label>Mobile Number to Appear on Visiting Card *</Label>
                    <Input
                      value={formData.mobileOnVisitingCard}
                      onChange={(e) => handleChange(e, 'mobileOnVisitingCard')}
                      placeholder="Enter mobile number for visiting card"
                    />
                    {errors.mobileOnVisitingCard && <p className="text-red-500 text-sm">{errors.mobileOnVisitingCard}</p>}
                  </div>
                </div>
                <div>
                  <Label>Regional Language Preferred for Posters (Posters will be printed in this language + English) *</Label>
                  <Select
                    value={formData.regionalLanguage}
                    onValueChange={(value) => handleChange(value, 'regionalLanguage')}
                  >
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
                  {errors.regionalLanguage && <p className="text-red-500 text-sm">{errors.regionalLanguage}</p>}
                  {formData.regionalLanguage === 'other' && (
                    <div className="mt-2">
                      <Input
                        value={formData.regionalLanguageOther}
                        onChange={(e) => handleChange(e, 'regionalLanguageOther')}
                        placeholder="Please specify language"
                      />
                      {errors.regionalLanguageOther && <p className="text-red-500 text-sm">{errors.regionalLanguageOther}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-3">Branded T-Shirt Sizes (any two) *</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Franchise Partner</Label>
                      <Select
                        value={formData.tshirtSize1}
                        onValueChange={(value) => handleChange(value, 'tshirtSize1')}
                      >
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
                      {errors.tshirtSize1 && <p className="text-red-500 text-sm">{errors.tshirtSize1}</p>}
                    </div>
                    <div>
                      <Label>For Staff</Label>
                      <Select
                        value={formData.tshirtSize2}
                        onValueChange={(value) => handleChange(value, 'tshirtSize2')}
                      >
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
                      {errors.tshirtSize2 && <p className="text-red-500 text-sm">{errors.tshirtSize2}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 text-lg"
                style={{ backgroundColor: 'orange' }}
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
        </div>
      </div>
    </div>
  );
};

export default BrandingForm;