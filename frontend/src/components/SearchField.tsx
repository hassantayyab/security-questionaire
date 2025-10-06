'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
    className={cn('text-gray-400', className)}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M6 2C3.79086 2 2 3.79086 2 6C2 8.20914 3.79086 10 6 10C8.20914 10 10 8.20914 10 6C10 3.79086 8.20914 2 6 2ZM0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 7.29583 11.5892 8.49572 10.8907 9.47653L15.7071 14.2929C16.0976 14.6834 16.0976 15.3166 15.7071 15.7071C15.3166 16.0976 14.6834 16.0976 14.2929 15.7071L9.47653 10.8907C8.49572 11.5892 7.29583 12 6 12C2.68629 12 0 9.31371 0 6Z'
      fill='#9CA3AF'
    />
  </svg>
);

export const SearchField = ({
  placeholder = 'Search',
  value,
  onChange,
  className = '',
}: SearchFieldProps) => {
  const [internalValue, setInternalValue] = useState('');

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className='bg-white relative rounded border border-gray-200 shadow-xs focus-within:border-violet-600 focus-within:ring-1 focus-within:ring-violet-600 transition-all duration-200'>
        <div className='flex items-center gap-2 px-3 py-2'>
          <SearchIcon className='shrink-0 size-3' />
          <input
            type='text'
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            className='flex-1 text-xs font-normal text-gray-900 placeholder:text-gray-500 bg-transparent border-0 outline-none leading-3'
          />
        </div>
      </div>
    </div>
  );
};

export default SearchField;
