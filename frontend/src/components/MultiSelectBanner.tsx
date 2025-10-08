'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface MultiSelectBannerProps {
  /** Number of items selected */
  selectedCount: number;
  /** Item type name (singular) - e.g., "question", "document" */
  itemType: string;
  /** Action buttons to display */
  children: ReactNode;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Reusable multi-select banner component
 * Positioned absolutely at the top center of the screen
 * Shows selected count, action buttons, and a close button
 */
export const MultiSelectBanner = ({
  selectedCount,
  itemType,
  children,
  onClose,
  className = '',
}: MultiSelectBannerProps) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-gray-800 rounded-bl-md rounded-br-md shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)] px-7 py-4 flex gap-3 items-center transition-all duration-200 ${className}`}
    >
      <div className='flex gap-3 items-center'>
        <p className='font-normal text-sm text-gray-300 whitespace-pre'>
          {selectedCount} {itemType}
          {selectedCount !== 1 ? 's' : ''} selected
        </p>
        {children}
      </div>

      <button
        onClick={onClose}
        className='border border-gray-200 rounded size-8 flex items-center justify-center hover:bg-gray-700 transition-colors duration-200 cursor-pointer text-sm'
        aria-label='Clear selection'
        type='button'
      >
        <X className='w-4 h-4 text-gray-200' strokeWidth={2} />
      </button>
    </div>
  );
};

interface BannerActionButtonProps {
  /** Button label */
  children: ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Action button for use within MultiSelectBanner
 * Styled to match the Figma design specs
 */
export const BannerActionButton = ({
  children,
  onClick,
  disabled = false,
  className = '',
}: BannerActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border border-gray-200 border-solid rounded px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      type='button'
    >
      {children}
    </button>
  );
};
