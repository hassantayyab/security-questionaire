'use client';

import { FileText, X } from 'lucide-react';

interface FileCardProps {
  fileName: string;
  fileSize: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  disabled?: boolean;
}

export const FileCard = ({
  fileName,
  fileSize,
  onRemove,
  showRemoveButton = true,
  disabled = false,
}: FileCardProps) => {
  return (
    <div
      className='flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg group 
    hover:border-gray-300 transition-colors'
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <FileText className='w-5 h-5 text-gray-500 flex-shrink-0' />
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <p className='truncate text-sm font-medium text-gray-900' title={fileName}>
            {fileName}
          </p>
          <p className='text-xs text-gray-500'>{fileSize}</p>
        </div>
      </div>
      {showRemoveButton && onRemove && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled}
          className='flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
};
