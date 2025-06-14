import { format } from 'date-fns';
import { FormData } from '@/types/franchise-form';

export const submitToGoogleSheets = async (data: FormData) => {
  try {
    const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/hvwtzwug2y8pw';

    // Calculate IST time
    const now = new Date();
    const istOffset = 330;
    const istDate = new Date(now.getTime() + (istOffset - now.getTimezoneOffset()) * 60000);
    const formattedIST = format(istDate, "EEE, MMMM dd, yyyy, hh:mm a 'IST'");

    // Helper function to sanitize values
    const sanitizeString = (value: string | undefined): string => {
      if (!value) return "";
      try {
        return encodeURI(value).replace(/,/g, '%2C');
      } catch (error) {
        console.warn('Error encoding value:', value, error);
        return "";
      }
    };

    const transformedData = [{
      "Franchisee_Name": data.franchiseeName || "",
      "Business_Name": data.businessName || "",
      "Franchise_Location": data.franchiseLocation || "",
      "Opening_Date": data.openingDate ? format(data.openingDate, 'MM/dd/yyyy') : '',
      "Office_Address": `${data.streetAddress || ""}, ${data.townLocality || ""}, ${data.city || ""}, ${data.stateProvince || ""}, ${data.postalCode || ""}, ${data.country || ""}`,
      "Office_Area": data.officeArea === 'other' ? (data.customArea || "") : (data.officeArea || ""),
      "Setup_Type": data.setupType || "",
      "Infrastructure": Object.entries(data.infrastructure)
        .map(([key, value]) => `${key}: ${value ? 'Yes' : 'No'}`)
        .join(', '),
      "SPOC_Name": data.spocName || "",
      "SPOC_Mobile": data.spocMobile || "",
      "SPOC_Email": data.spocEmail || "",
      "Alternate_Contact": data.alternateContact || "",
      "Documents_Status": Object.entries(data.documents)
        .map(([key, doc]) => `${key}: ${doc.status}`)
        .join(', '),
      "Readiness_Confirmation": data.readinessConfirm ? "Yes" : "No",
      "Not_Ready_Reason": data.notReadyReason || "",
      "Submission_Date": data.submissionDate ? format(data.submissionDate, 'MM/dd/yyyy') : '',
      // "Signature": data.signature || "",
      "Owner_First_Name": data.ownerFirstName || "",
      "Owner_Last_Name": data.ownerLastName || "",
      "Owner_Phone": data.ownerPhone || "",
      "Owner_Email": data.ownerEmail || "",
      "Permanent_Address": JSON.stringify(data.permanentAddress || {}),
      "Current_Address": JSON.stringify(data.currentAddress || {}),
      "Same_as_Permanent": data.sameAsPermanent ? "Yes" : "No",
      "Form_Filled_At": formattedIST,
      "Aadhaar_front": data.documents.aadhaar?.front ? sanitizeString(data.documents.aadhaar.front) : "",
      "Aadhaar_back": data.documents.aadhaar?.back ? sanitizeString(data.documents.aadhaar.back) : "",
      "PAN_Card": data.documents.pan?.driveLink ? sanitizeString(data.documents.pan.driveLink) : "",
      "Passport_size_Photograph": data.documents.photograph?.driveLink ? sanitizeString(data.documents.photograph.driveLink) : "",
      "Business_Registration_GST_Udyam": data.documents.businessReg?.driveLink ? sanitizeString(data.documents.businessReg.driveLink) : "",
      "Cancelled_Cheque_Passbook_Copy": data.documents.cheque?.driveLink ? sanitizeString(data.documents.cheque.driveLink) : "",
      "Rental_Agreement_or_Property_Proof": data.documents.rental?.driveLink ? sanitizeString(data.documents.rental.driveLink) : "",
      "Latest_Electricity_Bill": data.documents.electricity?.driveLink ? sanitizeString(data.documents.electricity.driveLink) : "",
      // "Background_Clearance_Declaration": data.documents.background?.driveLink ? sanitizeString(data.documents.background.driveLink) : "",
      "Signed_Franchise_Agreement": data.documents.agreement?.driveLink ? sanitizeString(data.documents.agreement.driveLink) : "",
      "PAN_Card_Business": data.documents.panCopy?.driveLink ? sanitizeString(data.documents.panCopy.driveLink) : "",
      "Secondary_ID_DL_Passport_Voter_ID": data.documents.secondaryId?.driveLink ? sanitizeString(data.documents.secondaryId.driveLink) : ""
    }];

    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: transformedData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Submission error:', errorData);
      throw new Error(`Submission failed: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
};