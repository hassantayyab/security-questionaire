'use client';

import { useCallback, useId, useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { StandardDialog } from './standard-dialog';

const DEFAULT_ACCEPTED_TYPES = ['image/png'];
const DEFAULT_MAX_FILE_SIZE = 1_048_576;

type UploadResourceDialogProps = {
  trigger?: ReactNode;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  onUploadFile?: (file: File) => Promise<void> | void;
  onRemoveFile?: (file: File) => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const UploadResourceDialog = ({
  trigger,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  onUploadFile,
  onRemoveFile,
  open,
  onOpenChange,
}: UploadResourceDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropzoneId = useId();

  const fileInputAccept = useMemo(() => acceptedFileTypes.join(','), [acceptedFileTypes]);

  const handleFileSelection = useCallback(
    async (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        setErrorMessage(null);
        return;
      }

      if (!acceptedFileTypes.includes(file.type)) {
        setErrorMessage(`File type not supported. Allowed types: ${acceptedFileTypes.join(', ')}`);
        return;
      }

      if (file.size > maxFileSize) {
        const fileSizeLimitMb = Math.round((maxFileSize / 1024 / 1024) * 10) / 10;
        setErrorMessage(`File is too large. Max size: ${fileSizeLimitMb}MB`);
        return;
      }

      setErrorMessage(null);
      setSelectedFile(file);
      await onUploadFile?.(file);
    },
    [acceptedFileTypes, maxFileSize, onUploadFile],
  );

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      await handleFileSelection(file);
    },
    [handleFileSelection],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files.length === 0) {
        return;
      }

      const file = event.dataTransfer.files[0];
      await handleFileSelection(file);
    },
    [handleFileSelection],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    const fileToRemove = selectedFile;
    setSelectedFile(null);
    setErrorMessage(null);
    await onRemoveFile?.(fileToRemove);
  }, [onRemoveFile, selectedFile]);

  return (
    <StandardDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title='Add resource'
      maxWidth='sm:max-w-xl'
      onCancel={() => onOpenChange?.(false)}
      onAction={() => {}}
      actionDisabled={true}
      actionLabel='Save'
      cancelLabel='Cancel'
    >
      <div className='space-y-6'>
        <div className='space-y-2'>
          <p className='text-xs font-medium uppercase tracking-wide text-gray-700'>Document</p>
          <div
            role='button'
            tabIndex={0}
            id={dropzoneId}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById(`${dropzoneId}-input`)?.click()}
            className={cn(
              'flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 px-6 py-8 transition-colors',
              'bg-white text-center shadow-none outline-none focus-visible:border-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:ring-offset-2',
              isDragging && 'border-violet-500 bg-violet-50',
              errorMessage && 'border-red-300 bg-red-50/40',
              selectedFile && 'items-start gap-4 text-left',
            )}
          >
            <input
              id={`${dropzoneId}-input`}
              type='file'
              accept={fileInputAccept}
              className='hidden'
              onChange={handleFileInputChange}
            />

            {selectedFile ? (
              <div className='flex w-full items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-md bg-violet-600/10'>
                    <FileText className='h-5 w-5 text-violet-600' />
                  </span>
                  <p className='max-w-[240px] truncate text-sm font-medium text-gray-900'>
                    {selectedFile.name}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-8 rounded-md border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100'
                    onClick={(event) => {
                      event.stopPropagation();
                      document.getElementById(`${dropzoneId}-input`)?.click();
                    }}
                  >
                    Upload
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-8 rounded-md px-3 text-xs font-medium text-gray-500 hover:text-red-500'
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveFile().catch(console.error);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                <p className='text-sm'>
                  <button
                    type='button'
                    className='font-medium text-violet-600 underline-offset-4 transition-colors hover:text-violet-500'
                    onClick={(event) => {
                      event.stopPropagation();
                      document.getElementById(`${dropzoneId}-input`)?.click();
                    }}
                  >
                    Upload
                  </button>{' '}
                  <span className='text-gray-600'>or drag and drop</span>
                </p>
                <p className='text-xs text-gray-500'>PNG up to 1MB</p>
              </div>
            )}
          </div>
          {errorMessage && <p className='text-xs text-red-500'>{errorMessage}</p>}
        </div>
      </div>
    </StandardDialog>
  );
};
