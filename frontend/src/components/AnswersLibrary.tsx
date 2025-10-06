'use client';

import { FileText } from 'lucide-react';

interface AnswersLibraryProps {
  onCountChange?: (count: number) => void;
}

const AnswersLibrary = ({ onCountChange }: AnswersLibraryProps) => {
  return (
    <div className='flex items-center justify-center py-20'>
      <div className='text-center space-y-3'>
        <FileText className='w-16 h-16 text-gray-400 mx-auto' />
        <div className='text-lg font-medium text-gray-500'>Answers Library</div>
        <div className='text-sm text-gray-500'>This feature is coming soon. Check back later!</div>
      </div>
    </div>
  );
};

export default AnswersLibrary;
