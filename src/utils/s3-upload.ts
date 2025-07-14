import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'https://apis.earlyjobs.ai/api/upload';

export const uploadFileToS3 = async (file: File, franchiseId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/${franchiseId}`, formData, {
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