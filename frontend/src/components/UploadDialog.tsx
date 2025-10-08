'use client';

import { FileCard } from '@/components/FileCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { appConfig } from '@/config/app';
import { api } from '@/lib/api';
import { AlertCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadDialogProps {
  children: React.ReactNode;
  onUploadSuccess?: () => void;
}

export const UploadDialog = ({ children, onUploadSuccess }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null,
  );

  const validateFile = (file: File): string | null => {
    if (!file.type.includes('pdf')) {
      return 'Please upload a PDF file';
    }
    if (file.size > appConfig.maxFileSize) {
      return `File size must be less than ${appConfig.maxFileSize / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          // Check if file already exists
          const isDuplicate = uploadedFiles.some(
            (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
          );
          if (!isDuplicate) {
            newFiles.push(file);
          }
        }
      });

      if (errors.length > 0) {
        setError(errors.join('; '));
      } else {
        setError(null);
      }

      if (newFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          // Check if file already exists
          const isDuplicate = uploadedFiles.some(
            (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
          );
          if (!isDuplicate) {
            newFiles.push(file);
          }
        }
      });

      if (errors.length > 0) {
        setError(errors.join('; '));
      } else {
        setError(null);
      }

      if (newFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
    setError(null);
  };

  const resetForm = () => {
    setUploadedFiles([]);
    setError(null);
    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    const totalFiles = uploadedFiles.length;
    let successCount = 0;
    const failedFiles: string[] = [];

    try {
      // Upload files sequentially
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setUploadProgress({ current: i + 1, total: totalFiles });

        try {
          const response = await api.uploadPdf(file);

          if (response.success) {
            successCount++;
          } else {
            failedFiles.push(file.name);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          failedFiles.push(file.name);
        }
      }

      // Show results
      if (successCount === totalFiles) {
        toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
        onUploadSuccess?.();
        setOpen(false);
        resetForm();
      } else if (successCount > 0) {
        toast.warning(
          `Uploaded ${successCount} of ${totalFiles} files. ${failedFiles.length} failed.`,
        );
        // Remove successfully uploaded files
        setUploadedFiles((prev) => prev.filter((file) => failedFiles.includes(file.name)));
        setError(`Failed to upload: ${failedFiles.join(', ')}`);
      } else {
        setError('All uploads failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='bg-white max-w-2xl w-full rounded-lg shadow-2xl border-0 max-h-[85vh] flex flex-col'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between border-b border-gray-200 px-6 py-4 space-y-0 flex-shrink-0'>
          <DialogTitle className='text-base font-medium text-gray-900'>Add resource</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className='flex flex-col gap-5 p-6 overflow-y-auto flex-1'>
          {/* Document Upload Section */}
          <div className='flex flex-col gap-3 w-full'>
            {/* Drop Zone */}
            <div
              className={`bg-gray-50 border-2 border-dashed rounded-lg flex flex-col gap-2 h-[120px] items-center justify-center px-6 py-8 w-full cursor-pointer hover:bg-gray-100 transition-colors ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => !isUploading && handleDrop(e)}
            >
              <div className='flex flex-col items-center gap-2'>
                <FileText className='h-8 w-8 text-gray-400' />
                <span className='text-sm font-medium text-gray-600'>
                  <span className='text-violet-600 cursor-pointer'>Upload</span> or drag and drop
                </span>
                <span className='text-xs text-gray-500'>
                  PDF files up to {appConfig.maxFileSize / 1024 / 1024}MB each
                </span>
              </div>

              <input
                id='file-upload'
                type='file'
                accept='.pdf'
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className='hidden'
              />
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className='flex flex-col gap-2'>
                <div className='text-xs font-medium text-gray-700 uppercase tracking-wide'>
                  Selected Files ({uploadedFiles.length})
                </div>
                <div className='flex flex-col gap-2'>
                  {uploadedFiles.map((file, index) => (
                    <FileCard
                      key={`${file.name}-${index}`}
                      fileName={file.name}
                      fileSize={formatFileSize(file.size)}
                      onRemove={() => handleRemoveFile(file)}
                      disabled={isUploading}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
              <AlertCircle className='w-4 h-4 text-red-500 flex-shrink-0' />
              <span className='text-sm text-red-700'>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='bg-white border-t border-gray-200 flex flex-col gap-3 px-6 py-4 flex-shrink-0'>
          {/* Upload Progress */}
          {uploadProgress && (
            <div className='flex items-center gap-3 text-sm text-gray-600'>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-medium'>Uploading files...</span>
                  <span className='text-xs text-gray-500'>
                    {uploadProgress.current} of {uploadProgress.total}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1.5'>
                  <div
                    className='bg-violet-600 h-1.5 rounded-full transition-all duration-300'
                    style={{
                      width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-4 items-center justify-end'>
            <Button variant='outline' onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant='default'
              onClick={handleSave}
              disabled={uploadedFiles.length === 0}
              loading={isUploading}
            >
              {isUploading
                ? `Uploading...`
                : `Upload ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
