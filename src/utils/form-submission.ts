import { format } from 'date-fns';
import { FormData } from '@/types/franchise-form';

export const submitToGoogleSheets = async (data: FormData) => {
  console.log('Submitting data to Google Sheets:', data);

  const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/hvwtzwug2y8pw';


  // Format the current time in IST (system date: June 14, 2025, 12:44 PM IST)
  const now = new Date();
  // Convert to IST by adding 5 hours 30 minutes (330 minutes) offset
  const istOffset = 330; // IST is UTC+5:30
  const istDate = new Date(now.getTime() + (istOffset - now.getTimezoneOffset()) * 60000);
  const formattedIST = format(istDate, "EEE, MMMM dd, yyyy, hh:mm a 'IST'");

  // Helper function to sanitize URLs and strings
  const sanitizeString = (value: string | undefined): string => {
    if (!value) return "Not provided";
    try {
      return encodeURI(value).replace(/,/g, '%2C'); // Ensure commas are encoded
    } catch (error) {
      console.warn('Error encoding URL:', value, error);
      return "Invalid URL";
    }
  };

  // Transform data to match the updated sheet columns
  const transformedData = [
    {
      "Franchisee_Name": data.franchiseeName || "",
      "Business_Name": data.businessName || "",
      "Franchise_Location": data.franchiseLocation || "",
      "Opening_Date": data.openingDate ? format(data.openingDate, 'MM/dd/yyyy') : '',
      "Office_Address": `${data.streetAddress || ""}, ${data.townLocality || ""}, ${data.city || ""}, ${data.stateProvince || ""}, ${data.postalCode || ""}, ${data.country || ""}`,
      "Office_Area": data.officeArea === 'other' ? (data.customArea || "Not specified") : (data.officeArea || ""),
      "Setup_Type": data.setupType || "",
      "Infrastructure": Object.entries(data.infrastructure)
        .map(([key, value]) => `${key}: ${value ? 'Yes' : 'No'}`)
        .join(', '), // Flatten infrastructure object
      "SPOC_Name": data.spocName || "",
      "SPOC_Mobile": data.spocMobile || "",
      "SPOC_Email": data.spocEmail || "",
      "Alternate_Contact": data.alternateContact || "",
      "Documents_Status": Object.entries(data.documents)
        .map(([key, doc]) => `${key}: ${doc.status}`)
        .join(', '), // Flatten documents object
      "Readiness_Confirmation": data.readinessConfirm || "",
      "Not_Ready_Reason": data.notReadyReason || "",
      "Submission_Date": data.submissionDate ? format(data.submissionDate, 'dd/mm/yyyy') : '',
      "Signature": data.signature || "",
      "Form_Filled_At": formattedIST,
      "Aadhaar_front": data.documents.aadhaar.front ? sanitizeString(data.documents.aadhaar.front) : "Not provided",
      "Aadhaar_back": data.documents.aadhaar.back ? sanitizeString(data.documents.aadhaar.back) : "Not provided",
      "PAN_Card": data.documents.pan.status === 'submitted' ? sanitizeString(data.documents.pan.driveLink) : "Not provided",
      "Passport_size_Photograph": data.documents.photograph.status === 'submitted' ? sanitizeString(data.documents.photograph.driveLink) : "Not provided",
      "Business_Registration_GST_Udyam": data.documents.businessReg.status === 'submitted' ? sanitizeString(data.documents.businessReg.driveLink) : "Not provided",
      "Cancelled_Cheque_Passbook_Copy": data.documents.cheque.status === 'submitted' ? sanitizeString(data.documents.cheque.driveLink) : "Not provided",
      "Rental_Agreement_or_Property_Proof": data.documents.rental.status === 'submitted' ? sanitizeString(data.documents.rental.driveLink) : "Not provided",
      "Latest_Electricity_Bill": data.documents.electricity.status === 'submitted' ? sanitizeString(data.documents.electricity.driveLink) : "Not provided",
      "Background_Clearance_Declaration": data.documents.background.status === 'submitted' ? sanitizeString(data.documents.background.driveLink) : "Not provided",
      "Signed_Franchise_Agreement": data.documents.agreement.status === 'submitted' ? sanitizeString(data.documents.agreement.driveLink) : "Not provided",
      "PAN_Card_Copy": data.documents.panCopy.status === 'submitted' ? sanitizeString(data.documents.panCopy.driveLink) : "Not provided",
      "Secondary_ID_DL_Passport_Voter_ID": data.documents.secondaryId.status === 'submitted' ? sanitizeString(data.documents.secondaryId.driveLink) : "Not provided",
    }
  ];

  // Log the transformed data for debugging
  console.log('Transformed data being sent to SheetDB:', JSON.stringify(transformedData, null, 2));

  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Submission failed: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
  }

  return { success: true };
};