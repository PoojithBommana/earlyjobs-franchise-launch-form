import { format } from 'date-fns';
import { FormData } from '@/types/franchise-form';

export const submitToGoogleSheets = async (data: FormData) => {
  console.log('Submitting data to Google Sheets:', data);

  const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/hvwtzwug2y8pw';

  // Calculate IST time
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const formattedIST = format(istTime, "yyyy-MM-dd HH:mm:ss");

  // Transform data to match Google Sheet column headers exactly
  const transformedData = {
    Franchisee_Name: data.franchiseeName || '',
    Business_Name: data.businessName || '',
    Franchise_Location: data.franchiseLocation || '',
    Opening_Date: data.openingDate ? format(data.openingDate, 'yyyy-MM-dd') : '',
    Office_Address: data.officeAddress || '',
    Office_Area: data.officeArea === 'other' ? data.customArea || 'Not specified' : data.officeArea || '',
    Setup_Type: data.setupType || '',
    Infrastructure: data.infrastructure ? JSON.stringify(data.infrastructure) : '',
    SPOC_Name: data.spocName || '',
    SPOC_Mobile: data.spocMobile || '',
    SPOC_Email: data.spocEmail || '',
    Alternate_Contact: data.alternateContact || '',
    Documents_Status: data.documents ? JSON.stringify(data.documents) : '',
    Readiness_Confirmation: data.readinessConfirm || '',
    Not_Ready_Reason: data.notReadyReason || '',
    Submission_Date: data.submissionDate ? format(data.submissionDate, 'yyyy-MM-dd') : formattedIST,
    Signature: data.signature || '',
    Owner_First_Name: data.ownerFirstName || '',
    Owner_Last_Name: data.ownerLastName || '',
    Owner_Phone: data.ownerPhone || '',
    Owner_Email: data.ownerEmail || '',
    Permanent_Address: data.permanentAddress ? JSON.stringify(data.permanentAddress) : '',
    Current_Address: data.currentAddress ? JSON.stringify(data.currentAddress) : '',
    Same_as_Permanent: data.sameAsPermanent ? 'Yes' : 'No',
    // Safely handle Additional_Info_1 and Additional_Info_2
    Additional_Info_1: (data as any).additionalInfo1 || '',
    Additional_Info_2: (data as any).additionalInfo2 || '',
    Form_Filled_At: formattedIST,
    Aadhaar_PAN_of_Owner: data.documents?.aadhaarPan?.driveLink || 'Not provided',
    Passport_size_Photograph: data.documents?.photograph?.driveLink || 'Not provided',
    Business_Registration_GST_Udyam: data.documents?.businessReg?.driveLink || 'Not provided',
    Cancelled_Cheque_Passbook_Copy: data.documents?.cheque?.driveLink || 'Not provided',
    Rental_Agreement_or_Property_Proof: data.documents?.rental?.driveLink || 'Not provided',
    Latest_Electricity_Bill: data.documents?.electricity?.driveLink || 'Not provided',
    Background_Clearance_Declaration: data.documents?.background?.driveLink || 'Not provided',
    Signed_Franchise_Agreement: data.documents?.agreement?.driveLink || 'Not provided',
    PAN_Card_Copy: data.documents?.panCopy?.driveLink || 'Not provided',
    Secondary_ID_DL_Passport_Voter_ID: data.documents?.secondaryId?.driveLink || 'Not provided',
  };

  try {
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [transformedData] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Submission error:', errorData);
      throw new Error(
        `Submission failed: ${response.status} - ${response.statusText}. Details: ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    console.log('Submission response:', result);
    return { success: true, data: result };
  } catch (err) {
    console.error('Error submitting to GoogleSheets:', err);
    throw err;
  }
};