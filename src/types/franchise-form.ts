
import { z } from 'zod';

// Define a schema for each document to conditionally validate the driveLink
const documentSchema = z.object({
  status: z.enum(['submitted', 'pending']),
  driveLink: z.string().optional(), // Allow empty strings, validate URL format later
}).refine(
  (data) => {
    if (data.status === 'submitted') {
      return true; // No driveLink needed for submitted status
    }
    if (data.status === 'pending' && !data.driveLink) {
      return false; // Require driveLink if pending and empty
    }
    if (data.status === 'pending' && data.driveLink) {
      // Validate URL format only if driveLink is non-empty
      const urlRegex = /^https?:\/\/(www\.)?drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view\?usp=sharing$/;
      return urlRegex.test(data.driveLink);
    }
    return true;
  },
  {
    message: 'A valid Google Drive shareable link is required when status is pending (e.g., https://drive.google.com/file/d/{fileId}/view?usp=sharing)',
    path: ['driveLink'],
  }
);

export const formSchema = z.object({
  franchiseeName: z.string().min(2, 'Full name is required'),
  businessName: z.string().optional(),
  franchiseLocation: z.string().min(2, 'Location is required'),
  openingDate: z.date({ required_error: 'Opening date is required' }),
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
  spocName: z.string().min(2, 'SPOC name is required'),
  spocMobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid mobile number required'),
  spocEmail: z.string().email('Valid email required'),
  alternateContact: z.string().optional(),
  documents: z.object({
    aadhaarPan: documentSchema,
    photograph: documentSchema,
    businessReg: documentSchema,
    cheque: documentSchema,
    rental: documentSchema,
    electricity: documentSchema,
    background: documentSchema,
    agreement: documentSchema,
    fdd: documentSchema,
    panCopy: documentSchema,
    secondaryId: documentSchema,
  }),
  readinessConfirm: z.enum(['yes', 'not-yet']),
  notReadyReason: z.string().optional(),
  declaration: z.boolean().refine(val => val === true, 'Declaration must be accepted'),
  submissionDate: z.date({ required_error: 'Submission date is required' }),
  signature: z.string().min(2, 'Signature is required'),
}).refine(
  (data) => data.officeArea !== 'other' || (data.officeArea === 'other' && data.customArea && data.customArea.length > 0),
  {
    message: 'Custom area must be specified when "Other" is selected',
    path: ['customArea'],
  }
).refine(
  (data) => data.readinessConfirm !== 'not-yet' || (data.readinessConfirm === 'not-yet' && data.notReadyReason && data.notReadyReason.length > 0),
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
