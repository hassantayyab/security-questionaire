'use client';

import AIGenerationProgress from '@/components/AIGenerationProgress';
import SearchField from '@/components/SearchField';
import { Questionnaire } from '@/types';
import { Clock, Download } from 'lucide-react';
import { ReactNode } from 'react';

interface QuestionnaireDetailViewProps {
  questionnaire: Questionnaire;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onExport: () => void;
  approvedCount: number;
  totalCount: number;
  isGenerating?: boolean;
  generationProgress?: {
    completed: number;
    total: number;
  } | null;
  children?: ReactNode;
}

const QuestionnaireDetailView = ({
  questionnaire,
  searchTerm,
  onSearchChange,
  onBack,
  onExport,
  approvedCount,
  totalCount,
  isGenerating = false,
  generationProgress = null,
  children,
}: QuestionnaireDetailViewProps) => {
  // Check if all questions are approved
  const isCompleted = totalCount > 0 && approvedCount === totalCount;

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='space-y-4'>
        {/* Breadcrumb and Title Section */}
        <div className='space-y-4'>
          <button
            onClick={onBack}
            className='text-xs font-medium text-gray-500 hover:text-violet-600 hover:underline transition-colors cursor-pointer underline-offset-2'
          >
            Questionnaires
          </button>

          {/* Title and Actions */}
          <div className='flex items-start justify-between'>
            <div className='space-y-1 flex-1 max-w-[420px]'>
              {/* Title with Status Badge */}
              <div className='flex items-center gap-3'>
                <h1 className='text-sm font-medium text-gray-900 leading-5'>
                  {questionnaire.name}
                </h1>
                {isCompleted ? (
                  <div className='bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-[10px] flex items-center justify-center'>
                    <span className='text-xs text-emerald-800 font-normal text-center whitespace-nowrap'>
                      Completed
                    </span>
                  </div>
                ) : (
                  <div className='bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-[10px] flex items-center gap-1'>
                    <Clock className='w-[11.2px] h-[11.2px] text-gray-600' />
                    <span className='text-xs text-gray-600 font-normal text-center whitespace-nowrap'>
                      In progress
                    </span>
                  </div>
                )}
              </div>
              <p className='text-xs text-gray-500 leading-4'>
                You can generate answers with our AI or edit them manually. Once you&apos;re done,
                simply mark each answer as approved.
              </p>
            </div>

            {/* Export Button */}
            {approvedCount > 0 && (
              <button
                onClick={onExport}
                className='bg-white border border-gray-300 text-gray-700 px-3 py-[7px] rounded text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer'
              >
                <Download className='h-4 w-4' />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Progress Section */}
      <div className='flex items-center justify-between w-full'>
        <div className='w-64'>
          <SearchField placeholder='Search' value={searchTerm} onChange={onSearchChange} />
        </div>

        {/* AI Generation Progress (right-aligned) - Always show when progress data exists */}
        {generationProgress && (
          <AIGenerationProgress
            completed={generationProgress.completed}
            total={generationProgress.total}
          />
        )}
      </div>

      {/* Content (Questions Table will be passed as children) */}
      {children}
    </div>
  );
};

export default QuestionnaireDetailView;
