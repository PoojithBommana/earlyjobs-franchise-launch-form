
import { z } from 'zod';

export const brandingFormSchema = z.object({
  // Section A: Franchise Identification & Shipping Details
  franchiseOwnerName: z.string().min(1, "Franchise Owner Name is required"),
  businessName: z.string().optional(),
  franchiseLocation: z.string().min(1, "Franchise Location is required"),
  shippingAddress: z.string().min(1, "Full Shipping Address is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  alternateMobile: z.string().optional(),
  preferredWorkingHours: z.string().min(1, "Preferred Working Hours is required"),

  // Section B: Office Branding Setup Details
  officeType: z.enum(['owned', 'rented', 'coworking'], {
    required_error: "Office Type is required"
  }),
  frontageType: z.enum(['wall', 'glass', 'shutter', 'other'], {
    required_error: "Office Frontage Type is required"
  }),
  frontageTypeOther: z.string().optional(),
  flexLength: z.string().min(1, "Flex Length is required"),
  flexHeight: z.string().min(1, "Flex Height is required"),
  standeeLength: z.string().min(1, "Standee Length is required"),
  standeeDepth: z.string().min(1, "Standee Depth is required"),
  wallColor: z.enum(['white', 'lightBlue', 'other'], {
    required_error: "Wall Color is required"
  }),
  wallColorOther: z.string().optional(),
  mountingSurface: z.enum(['nails', 'hooks', 'tape'], {
    required_error: "Surface for Mounting is required"
  }),

  // Section C: Brand Personalization Details
  ownerNameForCertificate: z.string().min(1, "Owner Name for Certificate is required"),
  designation: z.enum(['managingPartner', 'director', 'other'], {
    required_error: "Designation is required"
  }),
  designationOther: z.string().optional(),
  nameOnVisitingCard: z.string().min(1, "Name on Visiting Card is required"),
  mobileOnVisitingCard: z.string().min(10, "Mobile number for Visiting Card is required"),
  regionalLanguage: z.enum(['hindi', 'tamil', 'kannada', 'telugu', 'gujarati', 'bengali', 'marathi', 'other'], {
    required_error: "Regional Language is required"
  }),
  regionalLanguageOther: z.string().optional(),
  tshirtSize1: z.enum(['S', 'M', 'L', 'XL', 'XXL'], {
    required_error: "First T-shirt size is required"
  }),
  tshirtSize2: z.enum(['S', 'M', 'L', 'XL', 'XXL'], {
    required_error: "Second T-shirt size is required"
  }),

  // Section D: Optional Local Print Support
  localPrintingPreference: z.boolean().default(false),
  fileFormat: z.enum(['PDF', 'Corel', 'AI', 'PNG']).optional(),

  // Form submission details (optional since they're not in the UI)
  submissionDate: z.date().optional(),
  signature: z.string().optional(),
});

export type BrandingFormData = z.infer<typeof brandingFormSchema>;
