
import { format } from 'date-fns';
import { BrandingFormData } from '@/types/branding-form';

export const submitBrandingForm = async (data: BrandingFormData) => {
  console.log('Submitting branding data to Google Sheets:', data);

  const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/w15c57fnzal66';
  
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const formattedIST = format(istTime, "EEE, MMMM dd, yyyy, hh:mm a 'IST'");

  const transformedData = {
    "Form Type": "Branding Kit",
    "Franchise Owner Name": data.franchiseOwnerName,
    "Business Name": data.businessName || "",
    "Franchise Location": data.franchiseLocation,
    "Shipping Address": data.shippingAddress,
    "Mobile Number": data.mobileNumber,
    "Alternate Mobile": data.alternateMobile || "",
    "Preferred Working Hours": data.preferredWorkingHours,
    "Office Type": data.officeType,
    "Frontage Type": data.frontageType === 'other' ? data.frontageTypeOther || "Other" : data.frontageType,
    "Flex Dimensions": `${data.flexLength}ft x ${data.flexHeight}ft`,
    "Standee Dimensions": `${data.standeeLength}ft x ${data.standeeDepth}ft`,
    "Wall Color": data.wallColor === 'other' ? data.wallColorOther || "Other" : data.wallColor,
    "Mounting Surface": data.mountingSurface,
    "Owner Name for Certificate": data.ownerNameForCertificate,
    "Designation": data.designation === 'other' ? data.designationOther || "Other" : data.designation,
    "Name on Visiting Card": data.nameOnVisitingCard,
    "Mobile on Visiting Card": data.mobileOnVisitingCard,
    "Regional Language": data.regionalLanguage === 'other' ? data.regionalLanguageOther || "Other" : data.regionalLanguage,
    "T-shirt Size 1": data.tshirtSize1,
    "T-shirt Size 2": data.tshirtSize2,
    "Local Printing Preference": data.localPrintingPreference ? "Yes" : "No",
    "File Format": data.fileFormat || "",
    "Submission Date": data.submissionDate ? format(data.submissionDate, 'MM/dd/yyyy') : '',
    "Signature": data.signature,
    "Form Filled At": formattedIST,
    "Sheet Tab": "Branding Kit Submissions"
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
