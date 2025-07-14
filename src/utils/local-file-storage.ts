/**
 * Local storage utility for handling files when upload server is unavailable
 */

export interface LocalFileData {
  file: File;
  dataUrl: string;
  timestamp: number;
  originalName: string;
}

const LOCAL_FILES_KEY = 'earlyjobs_local_files';

export const storeFileLocally = (file: File, dataUrl: string): string => {
  const fileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const fileData: LocalFileData = {
    file,
    dataUrl,
    timestamp: Date.now(),
    originalName: file.name
  };
  
  // Store in sessionStorage (will be lost when tab closes)
  try {
    const existingFiles = getLocalFiles();
    existingFiles[fileId] = fileData;
    sessionStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(existingFiles));
  } catch (error) {
    console.warn('Could not store file locally:', error);
  }
  
  return fileId;
};

export const getLocalFiles = (): Record<string, LocalFileData> => {
  try {
    const stored = sessionStorage.getItem(LOCAL_FILES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Could not retrieve local files:', error);
    return {};
  }
};

export const clearLocalFiles = () => {
  try {
    sessionStorage.removeItem(LOCAL_FILES_KEY);
  } catch (error) {
    console.warn('Could not clear local files:', error);
  }
};

export const isLocalFileUrl = (url: string): boolean => {
  return url.startsWith('local_') || url.startsWith('data:');
};
