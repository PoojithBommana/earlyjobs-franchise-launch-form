import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'https://apis.earlyjobs.ai/api/upload';

export const uploadFileToS3 = async (file: File, franchiseId: string): Promise<string | null> => {
  try {
    console.log('Starting file upload:', file.name, 'to:', `${API_BASE_URL}/${franchiseId}`);
    
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/${franchiseId}`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Upload response:', response.data);

    if (response.data?.fileUrl) {
      toast.success("Photo uploaded successfully!");
      return response.data.fileUrl;
    } else {
      console.error('No fileUrl in response:', response.data);
      toast.error(response.data?.message || "Failed to upload photo - no file URL returned.");
      return null;
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Server error response:', error.response.status, error.response.data);
      if (error.response.status === 413) {
        toast.error("File too large. Please use files under 5MB.");
      } else if (error.response.status === 0 || error.message.includes('CORS')) {
        toast.error("Server configuration issue. Contact support for upload setup.");
      } else {
        toast.error(`Upload failed: ${error.response.data?.message || error.response.statusText}`);
      }
    } else if (error.request) {
      // Request was made but no response received (CORS or network)
      console.error('Network/CORS error:', error.request);
      toast.error("Cannot connect to upload server. Please contact support.");
    } else {
      // Something else happened
      console.error('Unexpected error:', error.message);
      toast.error("Unexpected error occurred. Please try again.");
    }
    
    return null;
  }
};