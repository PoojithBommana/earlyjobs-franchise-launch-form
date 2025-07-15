import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance for consistent configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json',
  }
});

const env = import.meta.env.VITE_APP_BACKEND;

export const uploadFileToS3 = async (
  file: File, 
  candidateId: string, 
  fieldName?: string
): Promise<string | null> => {
  try {
    // Different size limits based on file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    let maxSizeInMB;
    if (isPDF) {
      maxSizeInMB = 2; // 2MB for PDFs
    } else if (isImage) {
      maxSizeInMB = 5; // 5MB for images
    } else {
      maxSizeInMB = 3; // 3MB for other documents (DOC, DOCX)
    }
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
      const fileType = isPDF ? 'PDF' : isImage ? 'Image' : 'Document';
      toast.error(`${fileType} size (${fileSizeInMB}MB) exceeds the maximum allowed size of ${maxSizeInMB}MB. Please compress your file.`);
      return null;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    console.log(`Uploading file to S3: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - Type: ${file.type}`);
    
    // If fieldName is provided, use candidateId_fieldName format
    // If not provided, just use candidateId (for backward compatibility with PhotoUploadField)
    const uploadPath = fieldName ? `${candidateId}_${fieldName}` : candidateId;
    console.log(`Upload path: ${env}/${uploadPath}`);
    const response = await axiosInstance.post(
      `${env}/${uploadPath}`, 
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );


    if (response.data?.fileUrl) {
      toast.success("File uploaded successfully!");
      return response.data.fileUrl;
    } else {
      toast.error(response.data?.message || "Failed to upload file.");
      return null;
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      
      switch (status) {
        case 413:
          toast.error("File is too large for the server. Please use smaller files: PDFs (max 2MB), Images (max 5MB), Documents (max 3MB).");
          break;
        case 415:
          toast.error("File type not supported. Please use PDF, JPG, PNG, DOC, or DOCX files.");
          break;
        case 400:
          toast.error("Bad request. Please check your file and try again.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(`Upload failed: ${status} ${statusText}`);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error("Failed to upload file. Please try again.");
    }
    
    return null;
  }
};