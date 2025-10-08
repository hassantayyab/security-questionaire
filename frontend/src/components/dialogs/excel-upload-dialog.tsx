'use client';

import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/app';
import { api, ApiError } from '@/lib/api';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { StandardDialog } from './standard-dialog';

interface ExcelUploadDialogProps {
  children: React.ReactNode;
  onUploadSuccess?: () => void;
}

export const ExcelUploadDialog = ({ children, onUploadSuccess }: ExcelUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return 'Please upload an Excel file (.xlsx or .xls)';
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
      setError(null);
    }
  };

  const handleDelete = () => {
    setUploadedFile(null);
    setError(null);
  };

  const resetForm = () => {
    setUploadedFile(null);
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
      const response = await api.uploadExcel(uploadedFile);

      if (response.success) {
        toast.success(response.message || 'Questionnaire uploaded successfully');
        onUploadSuccess?.();
        setOpen(false);
        resetForm();
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Excel upload error:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to upload Excel file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StandardDialog
      open={open}
      onOpenChange={setOpen}
      trigger={children}
      title='Import Questionnaire'
      maxWidth='max-w-lg'
      onCancel={handleCancel}
      onAction={handleSave}
      actionDisabled={!uploadedFile}
      actionLoading={isUploading}
      actionLabel={isUploading ? 'Uploading...' : 'Save'}
    >
      <div className='flex flex-col gap-5'>
        {/* Document Upload Section */}
        <div className='flex flex-col gap-1 w-full'>
          <div
            className={`bg-gray-50 border-2 border-dashed rounded-lg flex flex-col gap-2 h-[120px] items-center justify-center px-6 py-8 w-full cursor-pointer hover:bg-gray-100 transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => !isUploading && document.getElementById('excel-file-upload')?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => !isUploading && handleDrop(e)}
          >
            {uploadedFile ? (
              <div className='flex flex-col items-center gap-3'>
                <div className='flex gap-3 items-center'>
                  <FileSpreadsheet className='h-5 w-5 text-gray-500' />
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
                      if (!isUploading) {
                        document.getElementById('excel-file-upload')?.click();
                      }
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
                      if (!isUploading) {
                        handleDelete();
                      }
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
                  Excel files (.xlsx, .xls) up to {appConfig.maxFileSize / 1024 / 1024}MB
                </span>
              </div>
            )}

            <input
              id='excel-file-upload'
              type='file'
              accept='.xlsx,.xls'
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

        {/* Upload Progress */}
        {isUploading && (
          <div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
            <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
            <span className='text-sm text-blue-700'>Uploading and processing Excel file...</span>
          </div>
        )}
      </div>
    </StandardDialog>
  );
};
