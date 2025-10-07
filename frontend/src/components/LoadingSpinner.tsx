'use client';

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ className = '', text = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className='flex items-center gap-2 px-3 py-2 rounded-lg'>
        {/* Spinner SVG */}
        <div className='relative w-4 h-4'>
          <svg
            className='animate-spin'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='8' cy='8' r='6' stroke='#D1D5DB' strokeWidth='2' fill='none' />
            <path
              d='M 14 8 A 6 6 0 0 1 8 14'
              stroke='#7C3AED'
              strokeWidth='2'
              strokeLinecap='round'
              fill='none'
            />
          </svg>
        </div>
        {/* Loading text */}
        <p className='text-xs font-normal text-gray-800'>{text}</p>
      </div>
    </div>
  );
};
