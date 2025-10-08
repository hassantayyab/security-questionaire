'use client';

import { Check, ChevronDown, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type QuestionnaireStatus = 'in_progress' | 'approved' | 'complete';

interface StatusOption {
  value: QuestionnaireStatus;
  label: string;
  icon: React.ReactNode;
}

interface QuestionnaireStatusDropdownProps {
  currentStatus: QuestionnaireStatus;
  onStatusChange: (status: QuestionnaireStatus) => void;
  disabled?: boolean;
}

const statusOptions: StatusOption[] = [
  {
    value: 'in_progress',
    label: 'In progress',
    icon: <Clock className='w-4 h-4 text-gray-600' />,
  },
  {
    value: 'approved',
    label: 'Approved',
    icon: <Check className='w-4 h-4 text-gray-600' />,
  },
  {
    value: 'complete',
    label: 'Complete',
    icon: <Check className='w-4 h-4 text-gray-600' />,
  },
];

const QuestionnaireStatusDropdown = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}: QuestionnaireStatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: QuestionnaireStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className='bg-white border border-gray-300 rounded px-3 py-[7px] text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <span className='text-gray-900'>Update status</span>
        <ChevronDown className='w-3.5 h-3.5 text-gray-600' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 py-1 w-[127px]'>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              className='w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2.5 cursor-pointer'
            >
              <span className='flex-1 whitespace-nowrap'>{option.label}</span>
              {currentStatus === option.value && <Check className='w-4 h-4 text-gray-600' />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireStatusDropdown;
