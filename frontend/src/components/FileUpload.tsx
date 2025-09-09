'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileUploadProps } from '@/types';
import { AlertCircle, CheckCircle, File, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({
  maxSize,
  onUpload,
  isUploading,
  allowedTypes,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.find((e: any) => e.code === 'file-too-large')) {
          setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        } else if (rejection.errors.find((e: any) => e.code === 'file-invalid-type')) {
          setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        } else {
          setError('File upload failed. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setError(null);
      }
    },
    [maxSize, allowedTypes],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setError(null);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='space-y-4'>
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          error && 'border-destructive',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <div className='p-8 text-center'>
          <input {...getInputProps()} />

          {isDragActive ? (
            <div className='space-y-2'>
              <Upload className='w-8 h-8 text-primary mx-auto' />
              <p className='text-sm font-medium text-primary'>Drop your file here</p>
            </div>
          ) : (
            <div className='space-y-3'>
              <Upload className='w-8 h-8 text-muted-foreground mx-auto' />
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Drop your file here or click to browse</p>
                <p className='text-xs text-muted-foreground'>
                  Supported formats: {allowedTypes.join(', ')} • Max size: {maxSize / 1024 / 1024}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className='flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <AlertCircle className='w-4 h-4 text-destructive' />
          <span className='text-sm text-destructive'>{error}</span>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                <File className='w-5 h-5 text-primary' />
              </div>
              <div>
                <p className='text-sm font-medium'>{selectedFile.name}</p>
                <p className='text-xs text-muted-foreground'>{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {!isUploading && (
                <Button variant='outline' size='sm' onClick={removeFile} className='h-8 w-8 p-0'>
                  <X className='w-4 h-4' />
                </Button>
              )}

              <Button onClick={handleUpload} disabled={isUploading} size='sm' className='gap-2'>
                {isUploading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-4 h-4' />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
