
import { format } from 'date-fns';
import { FormData } from '@/types/franchise-form';

export const submitToGoogleSheets = async (data: FormData) => {
  console.log('Submitting data to Google Sheets:', data);

  const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/w15c57fnzal66';
  
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const formattedIST = format(istTime, "EEE, MMMM dd, yyyy, hh:mm a 'IST'");

  const transformedData = {
    "Franchisee Name": data.franchiseeName,
    "Business Name": data.businessName || "",
    "Franchise Location": data.franchiseLocation,
    "Opening Date": data.openingDate ? format(data.openingDate, 'MM/dd/yyyy') : '',
    "Office Address": data.officeAddress,
    "Office Area": data.officeArea === 'other' ? data.customArea || "Not specified" : data.officeArea,
    "Setup Type": data.setupType,                                      
    "Infrastructure [JSON]": JSON.stringify(data.infrastructure),
    "SPOC Name": data.spocName,
    "SPOC Mobile": data.spocMobile,
    "SPOC Email": data.spocEmail,
    "Alternate Contact": data.alternateContact || "",
    "Documents Status [JSON]": JSON.stringify(data.documents),
    "Readiness Confirmation": data.readinessConfirm,
    "Not Ready Reason": data.notReadyReason || "",
    "Submission Date": data.submissionDate ? format(data.submissionDate, 'MM/dd/yyyy') : '',
    "Signature": data.signature,
    "Additional Info 1": "",
    "Additional Info 2": "",
    "Form Filled At": formattedIST,
    "Aadhaar/PAN of Owner": data.documents.aadhaarPan.status === 'pending' ? (data.documents.aadhaarPan.driveLink || "Not provided") : "Submitted",
    "Passport-size Photograph": data.documents.photograph.status === 'pending' ? (data.documents.photograph.driveLink || "Not provided") : "Submitted",
    "Business Registration (GST/Udyam)": data.documents.businessReg.status === 'pending' ? (data.documents.businessReg.driveLink || "Not provided") : "Submitted",
    "Cancelled Cheque/Passbook Copy": data.documents.cheque.status === 'pending' ? (data.documents.cheque.driveLink || "Not provided") : "Submitted",
    "Rental Agreement or Property Proof": data.documents.rental.status === 'pending' ? (data.documents.rental.driveLink || "Not provided") : "Submitted",
    "Latest Electricity Bill": data.documents.electricity.status === 'pending' ? (data.documents.electricity.driveLink || "Not provided") : "Submitted",
    "Background Clearance Declaration": data.documents.background.status === 'pending' ? (data.documents.background.driveLink || "Not provided") : "Submitted",
    "Signed Franchise Agreement": data.documents.agreement.status === 'pending' ? (data.documents.agreement.driveLink || "Not provided") : "Submitted",
    "Signed FDD Acknowledgement": data.documents.fdd.status === 'pending' ? (data.documents.fdd.driveLink || "Not provided") : "Submitted",
    "PAN Card Copy": data.documents.panCopy.status === 'pending' ? (data.documents.panCopy.driveLink || "Not provided") : "Submitted",
    "Secondary ID (DL/Passport/Voter ID)": data.documents.secondaryId.status === 'pending' ? (data.documents.secondaryId.driveLink || "Not provided") : "Submitted",
  };

  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: [transformedData] }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Submission failed: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
  }

  return { success: true };
};
