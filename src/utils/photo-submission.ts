import { format } from 'date-fns';
import { PhotoSubmissionFormData } from '@/types/photo-submission-form';

export const submitPhotoFormToGoogleSheets = async (data: PhotoSubmissionFormData) => {
  try {
    console.log('Starting photo form submission with data:', data);

    // Using the correct SheetDB API endpoint
    const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/r4japgrx814me';

    // Calculate IST time
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const formattedIST = format(istTime, "yyyy-MM-dd HH:mm:ss");

    // Helper function to sanitize values
    const sanitizeValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    // Helper function to handle photo URLs (only store S3 URLs)
    const sanitizePhotoUrl = (url: string | undefined): string => {
      if (!url) return "";
      
      // Only accept HTTPS URLs (S3 or other cloud storage)
      if (url.startsWith('https://')) {
        console.log('✅ Valid S3 URL found');
        return `=HYPERLINK("${url}", "View Photo")`;
      }
      
      // Skip data URLs completely
      if (url.startsWith('data:image/')) {
        console.log('🚫 Skipping data URL (too large for database)');
        return "";
      }
      
      return "";
    };

    // Transform data to match exact Google Sheets column headers
    const transformedData = {
      "Full_Name": sanitizeValue(data.Full_Name),
      "Franchise_District": sanitizeValue(data.Franchise_District),
      "Office_Address": sanitizeValue(data.Office_Address),
      "Branding_Completion_Date": data.Branding_Completion_Date ? format(new Date(data.Branding_Completion_Date), 'yyyy-MM-dd') : '',
      "Front_View_Photo": sanitizePhotoUrl(data.Front_View_Photo),
      "Reception_Photo": sanitizePhotoUrl(data.Reception_Photo),
      "Workstations_Photo": sanitizePhotoUrl(data.Workstations_Photo),
      "Meeting_Space_Photo": sanitizePhotoUrl(data.Meeting_Space_Photo),
      "Branded_Frame_Photo": sanitizePhotoUrl(data.Branded_Frame_Photo),
      "Branding_Elements_Count": sanitizeValue(data.Branding_Elements_Count),
      "Team_Photo": sanitizePhotoUrl(data.Team_Photo),
      "Branding_Complete": data.Branding_Complete === "yes" ? "Yes" : "No",
      "Additional_Notes": sanitizeValue(data.Additional_Notes),
      "Declaration_Confirmed": data.Declaration_Confirmed ? "Yes" : "No",
      "Form_Submitted_At": formattedIST
    };

    console.log('Transformed data for submission:', transformedData);

    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [transformedData] // Wrap in array as required by SheetDB
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Raw error response:', errorText);
      throw new Error(`Photo form submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Photo form submission successful:', result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Photo form submission error:', error);
    throw error;
  }
};

// Helper function to retry uploading local files to S3 before final submission
export const retryUploadLocalFiles = async (data: PhotoSubmissionFormData): Promise<PhotoSubmissionFormData> => {
  // This function could be enhanced to retry uploading any blob: URLs to S3
  // For now, we'll just return the data as-is
  // In a production app, you might want to:
  // 1. Check for blob: URLs in the photo fields
  // 2. Convert them back to files and retry S3 upload
  // 3. Update the URLs in the data before submission
  
  return data;
};