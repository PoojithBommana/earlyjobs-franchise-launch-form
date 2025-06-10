
import { DocumentKey, FormData } from '@/types/franchise-form';

export const documentsList: { key: DocumentKey; label: string }[] = [
  { key: 'Aadhaar/PAN of Owner', label: 'Aadhaar/PAN of Owner' },
  { key: 'Passport-size Photograph', label: 'Passport-size Photograph' },
  { key: 'Business Registration (GST/Udyam)', label: 'Business Registration (GST/Udyam)' },
  { key: 'Cancelled Cheque/Passbook Copy', label: 'Cancelled Cheque/Passbook Copy' },
  { key: 'Rental Agreement or Property Proof', label: 'Rental Agreement or Property Proof' },
  { key: 'Latest Electricity Bill', label: 'Latest Electricity Bill' },
  { key: 'Background Clearance Declaration', label: 'Background Clearance Declaration' },
  { key: 'Signed Franchise Agreement', label: 'Signed Franchise Agreement' },
  { key: 'Signed FDD Acknowledgement', label: 'Signed FDD Acknowledgement' },
  { key: 'PAN Card Copy', label: 'PAN Card Copy' },
  { key: 'Secondary ID (DL/Passport/Voter ID)', label: 'Secondary ID (DL/Passport/Voter ID)' },
];

export const documentKeyMap: Record<DocumentKey, keyof FormData['documents']> = {
  'Aadhaar/PAN of Owner': 'aadhaarPan',
  'Passport-size Photograph': 'photograph',
  'Business Registration (GST/Udyam)': 'businessReg',
  'Cancelled Cheque/Passbook Copy': 'cheque',
  'Rental Agreement or Property Proof': 'rental',
  'Latest Electricity Bill': 'electricity',
  'Background Clearance Declaration': 'background',
  'Signed Franchise Agreement': 'agreement',
  'Signed FDD Acknowledgement': 'fdd',
  'PAN Card Copy': 'panCopy',
  'Secondary ID (DL/Passport/Voter ID)': 'secondaryId',
};
