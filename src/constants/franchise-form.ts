
import { FormData } from '@/types/franchise-form';

// Define DocumentKey as a union of the exact string literals used as keys
export type DocumentKey =
  | 'aadhaar'
  | 'pan'
  | 'photograph'
  | 'businessReg'
  | 'cheque'
  | 'rental'
  | 'electricity'
  // | 'background'
  | 'agreement'
  | 'panCopy'
  | 'secondaryId';

// Define documentsList to match component
export const documentsList: { key: DocumentKey; label: string; dualUpload?: boolean }[] = [
  { key: 'aadhaar', label: "Franchisee Owner's Aadhaar", dualUpload: true },
  { key: 'pan', label: "Franchisee Owner's PAN" },
  { key: 'photograph', label: 'Passport-size Photograph' },
  { key: 'businessReg', label: 'Business Registration' },
  { key: 'cheque', label: 'Cancelled Cheque' },
  { key: 'rental', label: 'Rental Agreement' },
  { key: 'electricity', label: 'Latest Electricity Bill' },
  // { key: 'background', label: 'Background Verification' },
  { key: 'agreement', label: 'Franchise Agreement' },
  { key: 'panCopy', label: 'PAN Copy' },
  { key: 'secondaryId', label: 'Secondary ID' },
];

// Map DocumentKey to FormData document keys
export const documentKeyMap: Record<DocumentKey, keyof FormData['documents']> = {
  aadhaar: 'aadhaar',
  pan: 'pan',
  photograph: 'photograph',
  businessReg: 'businessReg',
  cheque: 'cheque',
  rental: 'rental',
  electricity: 'electricity',
  // background: 'background',
  agreement: 'agreement',
  panCopy: 'panCopy',
  secondaryId: 'secondaryId',
};
