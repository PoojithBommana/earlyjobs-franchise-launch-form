import { z } from 'zod';

// Define DocumentKey to match documentFields keys

// Schema for mandatory documents (except Aadhaar)
const mandatoryDocumentSchema = z.object({
  status: z.enum(['submitted', 'pending', 'error']),
  driveLink: z.string().min(1, 'Document upload is required'),
}).refine(
  (data) => data.status !== 'submitted' || data.driveLink,
  {
    message: 'Document upload is required',
    path: ['driveLink'],
  }
);
const documentSchema = z.object({
  status: z.enum(['submitted', 'pending']),
  driveLink: z.string(), // Allow empty strings, validate URL format later
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  town: z.string().min(1, 'Town/Locality is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().min(6, 'Valid PIN code is required'),
  country: z.string().min(1, 'Country is required'),})

// Schema for Aadhaar (mandatory front and back)
const aadhaarDocumentSchema = z.object({
  status: z.enum(['submitted', 'pending', 'error']),
  driveLink: z.string().optional(),
  front: z.string().min(1, 'Aadhaar front upload is required'),
  back: z.string().min(1, 'Aadhaar back upload is required'),
}).refine(
  (data) => data.status !== 'submitted' || (data.front && data.back),
  {
    message: 'Both Aadhaar front and back uploads are required',
    path: ['front'],
  }
);

// Schema for optional documents
const optionalDocumentSchema = z.object({
  status: z.enum(['submitted', 'pending', 'error']).optional().default('pending'),
  driveLink: z.string().optional(),
  front: z.string().optional(),
  back: z.string().optional(),
});

export const formSchema = z.object({
  franchiseeName: z.string().min(2, 'Full name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  franchiseLocation: z.string().min(2, 'Location is required'),
  openingDate: z.date({ required_error: 'Opening date is required' }),
  streetAddress: z.string().min(5, 'Street address is required'),
  townLocality: z.string().min(2, 'Town or locality is required'),
  city: z.string().min(2, 'City is required'),
  stateProvince: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  officeArea: z.enum(['250-300', '300-400', 'other']),
  customArea: z.string().optional(),
  setupType: z.enum(['owned', 'rented', 'coworking']),
  infrastructure: z.object({
    electricity: z.boolean(),
    desks: z.boolean(),
    reception: z.boolean(),
    interviewDesks: z.boolean(),
    brandingSpace: z.boolean(),
    broadband: z.boolean(),
    laptops: z.boolean(),
    printer: z.boolean(),
    whiteboard: z.boolean(),
    ups: z.boolean(),
    washroom: z.boolean(),
    drinkingWater: z.boolean(),
    cctvCoverage: z.boolean(),
    smartPhone: z.boolean(),
  }).refine(
    (data) => Object.values(data).some(value => value === true),
    {
      message: "At least one infrastructure item must be selected",
      path: [], // This will show the error at the root of infrastructure object
    }
  ),
  spocName: z.string().min(2, 'SPOC name is required'),
  spocMobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile number required'),
  spocEmail: z.string().email('Valid email required'),
  alternateContact: z.string().regex(/^[6-9]\d{9}$/, 'Valid alternate contact number required').optional(),
  documents: z.object({
    aadhaar: aadhaarDocumentSchema,
    pan: mandatoryDocumentSchema,
    photograph: mandatoryDocumentSchema,
    businessReg: mandatoryDocumentSchema,
    cheque: mandatoryDocumentSchema,
    rental: mandatoryDocumentSchema,
    electricity: mandatoryDocumentSchema,
    // background: mandatoryDocumentSchema,
    agreement: mandatoryDocumentSchema,
    panCopy: optionalDocumentSchema,
    secondaryId: optionalDocumentSchema,
  }),
  readinessConfirm: z.enum(['yes', 'not-yet']),
  notReadyReason: z.string().optional(),
  declaration: z.literal(true, { errorMap: () => ({ message: 'Declaration must be accepted' }) }),
  submissionDate: z.date({ required_error: 'Submission date is required' }),
  // signature: z.string().min(2, 'Signature is required'),
  ownerFirstName: z.string().min(1, 'First name is required'),
  ownerLastName: z.string().min(1, 'Last name is required'),
  ownerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Valid phone number is required'),
  ownerEmail: z.string().email('Valid email address is required'),
  permanentAddress: addressSchema,
  currentAddress: addressSchema,
  sameAsPermanent: z.boolean().default(false),
}).refine(
  (data) =>
    data.officeArea !== 'other' ||
    (data.officeArea === 'other' && data.customArea && data.customArea.length > 0),
  {
    message: 'Custom area must be specified when "Other" is selected',
    path: ['customArea'],
  }
).refine(
  (data) =>
    data.readinessConfirm !== 'not-yet' ||
    (data.readinessConfirm === 'not-yet' && data.notReadyReason && data.notReadyReason.length > 0),
  {
    message: 'Reason must be provided when not ready',
    path: ['notReadyReason'],
  }
);

export type FormData = z.infer<typeof formSchema>;

export type DocumentKey =
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
