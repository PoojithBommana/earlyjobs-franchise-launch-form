import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance for consistent configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json',
  }
});

const env= import.meta.env.VITE_APP_BACKEND

export const uploadFileToS3 = async (file: File, candidateId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${env}/${candidateId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data?.fileUrl) {
      toast.success("Photo uploaded successfully!");
      return response.data.fileUrl;
    } else {
      toast.error(response.data?.message || "Failed to upload photo.");
      return null;
    }
  } catch (error) {
    toast.error("Failed to upload photo. Please try again.");
    return null;
  }
};