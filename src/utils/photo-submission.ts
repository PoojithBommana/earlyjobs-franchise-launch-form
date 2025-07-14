import { format } from 'date-fns';
import { PhotoSubmissionFormData } from '@/types/photo-submission-form';
import { logUrlAnalysis, validateNoDataUrls } from './url-validator';

export const submitPhotoFormToGoogleSheets = async (data: PhotoSubmissionFormData) => {
  try {
    // Pre-validation: Check for data URLs and warn user
    const allPhotoFields = [
      { name: 'Front View Photo', url: data.frontViewPhoto },
      { name: 'Reception Photo', url: data.receptionAreaPhoto },
      { name: 'Workstations Photo', url: data.workstationsPhoto },
      { name: 'Meeting Space Photo', url: data.meetingSpacePhoto },
      { name: 'Team Photo', url: data.teamPhoto },
      ...(data.brandingElements || []).map((url, i) => ({ name: `Branding Element ${i + 1}`, url }))
    ];
    
    const dataUrls = allPhotoFields.filter(field => field.url?.startsWith('data:image/'));
    const s3Urls = allPhotoFields.filter(field => field.url?.startsWith('https://'));
    
    console.log('📊 Photo submission analysis:');
    console.log(`   - S3 URLs (will be stored): ${s3Urls.length}`);
    console.log(`   - Data URLs (will be SKIPPED): ${dataUrls.length}`);
    
    if (dataUrls.length > 0) {
      console.warn('⚠️ Some photos are stored as data URLs and will NOT be saved to database:');
      dataUrls.forEach(field => console.warn(`   - ${field.name}`));
    }

    // Log detailed analysis
    logUrlAnalysis({
      'Front View Photo': data.frontViewPhoto,
      'Reception Photo': data.receptionAreaPhoto,
      'Workstations Photo': data.workstationsPhoto,
      'Meeting Space Photo': data.meetingSpacePhoto,
      'Team Photo': data.teamPhoto,
      ...Object.fromEntries((data.brandingElements || []).map((url, i) => [`Branding ${i + 1}`, url]))
    });

    // Using the same SheetDB API endpoint as the main form
    const GOOGLE_SHEETS_URL = 'https://sheetdb.io/api/v1/q7jokcqtp5r2d';

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

    // Helper function to handle photo URLs (only store S3 URLs, completely skip data URLs)
    const sanitizePhotoUrl = (url: string | undefined): string => {
      if (!url) return "";
      
      // Only accept HTTPS URLs (S3 or other cloud storage)
      if (url.startsWith('https://')) {
        console.log('✅ Storing S3 URL:', url.substring(0, 100) + '...');
        return url;
      }
      
      // NEVER store data URLs - they're too large and cause database errors
      if (url.startsWith('data:image/')) {
        console.log('🚫 BLOCKING data URL from database storage (would exceed 50k character limit)');
        return ""; // Return empty string instead of storing massive data URL
      }
      
      // Log and skip any other unexpected formats
      console.warn('⚠️ Unexpected URL format, not storing:', url.substring(0, 50) + '...');
      return "";
    };

    const transformedData = [{
      // Basic Information
      "Full_Name": data.fullName || "",
      "Franchise_District": data.franchiseDistrict || "",
      "Office_Address": data.officeAddress || "",
      "Branding_Completion_Date": data.brandingCompletionDate ? format(data.brandingCompletionDate, 'MM/dd/yyyy') : '',
      
      // Photo URLs
      "Front_View_Photo": sanitizePhotoUrl(data.frontViewPhoto),
      "Reception_Photo": sanitizePhotoUrl(data.receptionAreaPhoto),
      "Workstations_Photo": sanitizePhotoUrl(data.workstationsPhoto),
      "Meeting_Space_Photo": sanitizePhotoUrl(data.meetingSpacePhoto),
      "Team_Photo": sanitizePhotoUrl(data.teamPhoto),
      
      // Branding Elements Count
      "Branding_Elements_Count": data.brandingElements ? data.brandingElements.length.toString() : "0",
      
      // Upload Status for tracking what's actually stored in database
      "Upload_Status": (() => {
        const allPhotos = [
          data.frontViewPhoto,
          data.receptionAreaPhoto, 
          data.workstationsPhoto,
          data.meetingSpacePhoto,
          data.teamPhoto,
          ...(data.brandingElements || [])
        ].filter(Boolean);
        
        const s3Photos = allPhotos.filter(url => url?.startsWith('https://'));
        const localPhotos = allPhotos.filter(url => url?.startsWith('data:'));
        const totalPhotos = allPhotos.length;
        
        // Only S3 URLs are actually stored in database
        const storedUrls = s3Photos.length;
        
        if (totalPhotos === 0) {
          return "No photos submitted";
        } else if (storedUrls === totalPhotos) {
          return `✅ All ${totalPhotos} photos stored as S3 URLs`;
        } else if (storedUrls === 0) {
          return `❌ 0/${totalPhotos} photos stored (all uploads failed - contact support)`;
        } else {
          return `⚠️ ${storedUrls}/${totalPhotos} photos stored as S3 URLs, ${localPhotos.length} upload failures`;
        }
      })(),
      
      // Confirmation & Notes
      "Branding_Complete": data.brandingAsPerChecklist === "yes" ? "Yes" : "No",
      "Additional_Notes": data.additionalNotes || "",
      "Declaration_Confirmed": data.declaration ? "Yes" : "No",
      
      // Form Submission Time
      "Form_Submitted_At": formattedIST
    }];

    console.log('Submitting photo form data:', transformedData);
    
    // Final validation: Ensure no data URLs are being sent
    const dataToSend = transformedData[0];
    const photoFields = ["Front_View_Photo", "Reception_Photo", "Workstations_Photo", "Meeting_Space_Photo", "Team_Photo"];
    
    const validation = validateNoDataUrls(dataToSend);
    if (!validation.valid) {
      console.error('🚨 CRITICAL: Data URLs detected in submission data!');
      validation.errors.forEach(error => console.error(`   - ${error}`));
      throw new Error('Invalid data format: Data URLs cannot be stored in database. ' + validation.errors.join(', '));
    }
    
    console.log('✅ Final validation passed: No data URLs in submission');

    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: transformedData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Photo form submission error:', errorData);
      throw new Error(`Photo form submission failed: ${response.status} - ${response.statusText}`);
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
