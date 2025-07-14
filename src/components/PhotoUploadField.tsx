import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, CheckCircle, X } from 'lucide-react';
import { uploadFileToS3 } from '@/utils/s3-upload';
import { compressImage } from '@/utils/image-compression';
import { toast } from 'sonner';

interface PhotoUploadFieldProps {
  label: string;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  candidateId: string;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  label,
  required = false,
  multiple = false,
  maxFiles = 1,
  value,
  onChange,
  candidateId,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(
    multiple ? (value as string[]) || [] : value ? [value as string] : []
  );

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles - uploadedFiles.length); i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png)$/)) {
        toast.error(`${file.name} is not a valid image format. Please use JPG or PNG.`);
        continue;
      }
      
      // Show original file size
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      try {
        // Compress image to reduce size (target: 1MB max)
        toast.info(`Compressing ${file.name}...`);
        const compressedFile = await compressImage(file, 1024); // 1MB target
        
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Final size check after compression
        if (compressedFile.size > 2 * 1024 * 1024) { // 2MB absolute max
          toast.error(`${file.name} is still too large after compression. Please use a smaller image.`);
          continue;
        }

        // Try to upload the compressed file to S3 with retries
        let url = null;
        let uploadAttempts = 0;
        const maxAttempts = 2; // Reduced attempts since CORS will consistently fail
        
        while (!url && uploadAttempts < maxAttempts) {
          uploadAttempts++;
          console.log(`Upload attempt ${uploadAttempts} for ${compressedFile.name}`);
          
          try {
            url = await uploadFileToS3(compressedFile, candidateId);
            
            if (url) {
              console.log(`Successfully uploaded to S3: ${url}`);
              break;
            }
          } catch (error) {
            console.error(`Upload attempt ${uploadAttempts} failed:`, error);
            
            if (uploadAttempts < maxAttempts) {
              // Wait 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        // If S3 upload failed, create a data URL as fallback
        if (!url) {
          console.log('❌ S3 upload failed for:', compressedFile.name);
          
          // Convert compressed file to data URL for storage and display
          url = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(compressedFile);
          });
          
          toast.warning(`Photo "${file.name}" will be stored locally. S3 upload failed - please contact support to resolve server connectivity.`);
          console.log('📁 Created data URL fallback for:', compressedFile.name);
        } else {
          console.log('✅ Successfully got S3 URL for:', compressedFile.name, '→', url);
          toast.success(`Photo "${file.name}" uploaded to S3 successfully!`);
        }
        
        if (url) {
          console.log('📸 Photo processed successfully:');
          console.log(`   - File: ${compressedFile.name}`);
          console.log(`   - Size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          console.log(`   - URL type: ${url.startsWith('https://') ? 'S3 URL' : 'Data URL'}`);
          console.log(`   - URL length: ${url.length} characters`);
          
          if (url.startsWith('data:')) {
            console.warn('⚠️ This data URL will NOT be stored in database (too large)');
          }
          
          newUrls.push(url);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}. Please try again.`);
      }
    }

    const updatedFiles = [...uploadedFiles, ...newUrls];
    setUploadedFiles(updatedFiles);

    if (multiple) {
      onChange(updatedFiles);
    } else {
      onChange(updatedFiles[0] || '');
    }

    setUploading(false);
  };

  const removeFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // Clean up blob URLs to prevent memory leaks (data URLs don't need cleanup)
    if (fileToRemove && fileToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove);
    }
    
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);

    if (multiple) {
      onChange(updatedFiles);
    } else {
      onChange('');
    }
  };

  const canUploadMore = uploadedFiles.length < maxFiles;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Upload button */}
      {canUploadMore && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <Input
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple={multiple && canUploadMore}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            disabled={uploading}
          />
          <Label
            htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600 text-center">
                <span className="font-medium">Click to upload</span> or drag and drop
                <br />
                JPG, PNG (will be compressed to under 2MB)
                {multiple && ` - ${maxFiles - uploadedFiles.length} more allowed`}
              </div>
            </div>
          </Label>
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((url, index) => (
            <Card key={index} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img 
                      src={url} 
                      alt={`Photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md border"
                      onError={(e) => {
                        // If image fails to load, show a placeholder
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-700">
                        Photo {index + 1} {url.startsWith('https://') ? '✅ Uploaded to S3' : '⚠️ Stored locally (S3 failed)'}
                      </span>
                    </div>
                    {url.startsWith('https://') ? (
                      <div className="space-y-1">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline block font-medium"
                        >
                          🔗 View Image on S3
                        </a>
                        <div className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-1 rounded">
                          {url}
                        </div>
                        <div className="text-xs text-green-600">
                          ✅ This URL will be stored in the database
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs text-orange-600 font-medium">
                          ⚠️ Image stored locally only (upload server unavailable)
                        </span>
                        <div className="text-xs text-gray-500">
                          Contact support to resolve S3 upload connectivity issues
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-sm text-gray-600">Uploading photo(s)...</div>
      )}
    </div>
  );
};