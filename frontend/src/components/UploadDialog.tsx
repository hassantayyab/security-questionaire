'use client';

import AppButton from '@/components/AppButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { appConfig } from '@/config/app';
import { api, ApiError } from '@/lib/api';
import { AlertCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface UploadDialogProps {
  children: React.ReactNode;
  onUploadSuccess?: () => void;
}

export const UploadDialog = ({ children, onUploadSuccess }: UploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setUploadedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      const validationError = validateFile(files[0]);
      if (validationError) {
        setError(validationError);
        return;
      }
      setUploadedFile(files[0]);
      setFileName(files[0].name);
      setError(null);
    }
  };

  const handleDelete = () => {
    setUploadedFile(null);
    setFileName('');
    setError(null);
  };

  const resetForm = () => {
    setUploadedFile(null);
    setFileName('');
    setError(null);
    setIsUploading(false);
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.uploadPdf(uploadedFile);

      if (response.success) {
        toast.success(response.message || 'Policy uploaded successfully');
        onUploadSuccess?.();
        setOpen(false);
        resetForm();
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to upload PDF. Please try again.');
      }
    } finally {
      setIsUploading(false);
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
      <DialogContent className='bg-white max-w-lg w-full rounded-lg shadow-2xl border-0'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between border-b border-gray-200 px-6 py-4 space-y-0'>
          <DialogTitle className='text-base font-medium text-gray-900'>Add resource</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className='flex flex-col gap-5 p-6'>
          {/* Document Upload Section */}
          <div className='flex flex-col gap-1 w-full'>
            <div
              className={`bg-gray-50 border-2 border-dashed rounded-lg flex flex-col gap-2 h-[120px] items-center justify-center px-6 py-8 w-full cursor-pointer hover:bg-gray-100 transition-colors ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => !isUploading && handleDrop(e)}
            >
              {uploadedFile ? (
                <div className='flex flex-col items-center gap-3'>
                  <div className='flex gap-3 items-center'>
                    <FileText className='h-5 w-5 text-gray-500' />
                    <div className='text-sm font-medium text-gray-700 truncate max-w-[250px]'>
                      {uploadedFile.name}
                    </div>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        !isUploading && document.getElementById('file-upload')?.click();
                      }}
                      disabled={isUploading}
                      className='hover:bg-white'
                    >
                      Upload
                    </Button>
                    <Button
                      variant='text'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        !isUploading && handleDelete();
                      }}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-2'>
                  <span className='text-sm font-medium text-gray-600'>
                    <span className='text-violet-600'>Upload</span> or drag and drop
                  </span>
                  <span className='text-xs text-gray-500'>
                    PDF up to {appConfig.maxFileSize / 1024 / 1024}MB
                  </span>
                </div>
              )}

              <input
                id='file-upload'
                type='file'
                accept='.pdf'
                onChange={handleFileUpload}
                disabled={isUploading}
                className='hidden'
              />
            </div>
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
        <div className='bg-white border-t border-gray-200 flex gap-4 items-center justify-end px-6 py-4'>
          <AppButton variant='secondary' onClick={handleCancel} disabled={isUploading}>
            Cancel
          </AppButton>
          <AppButton
            variant='primary'
            onClick={handleSave}
            disabled={!uploadedFile}
            loading={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
