'use client';

import ApprovalProgress from '@/components/ApprovalProgress';
import { ApprovalStatusIcon } from '@/components/icons';
import QuestionnaireStatusDropdown from '@/components/QuestionnaireStatusDropdown';
import SearchField from '@/components/SearchField';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Questionnaire } from '@/types';
import { Clock, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface QuestionnaireDetailViewProps {
  questionnaire: Questionnaire;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onExport: () => void;
  onStatusChange?: (status: 'in_progress' | 'approved' | 'complete') => void;
  approvedCount: number;
  answeredCount: number;
  totalCount: number;
  isGenerating?: boolean;
  isLoading?: boolean;
  generationProgress?: {
    completed: number;
    total: number;
  } | null;
  onGenerateAnswers?: () => void;
  children?: ReactNode;
}

const QuestionnaireDetailView = ({
  questionnaire,
  searchTerm,
  onSearchChange,
  onExport,
  onStatusChange,
  approvedCount,
  totalCount,
  isGenerating = false,
  isLoading = false,
  generationProgress = null,
  onGenerateAnswers,
  children,
}: QuestionnaireDetailViewProps) => {
  // Get status from questionnaire, default to 'in_progress'
  const status = questionnaire.status || 'in_progress';

  // Helper function to render status badge
  const renderStatusBadge = () => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant='approved' className='rounded-[10px] px-2.5'>
            Complete
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant='approved' className='rounded-[10px] px-2.5'>
            Approved
          </Badge>
        );
      case 'in_progress':
      default:
        return (
          <Badge variant='pending'>
            <Clock className='w-[11.2px] h-[11.2px]' />
            In Progress
          </Badge>
        );
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='space-y-4'>
          <Link
            href='/questionnaire'
            className='text-xs font-medium text-gray-500 hover:text-violet-600 hover:underline transition-colors cursor-pointer underline-offset-2 mb-4 inline-block'
          >
            Questionnaires
          </Link>

          <div className='flex items-start justify-between'>
            <div className='space-y-1 flex-1 max-w-[420px]'>
              <div className='flex items-center gap-3'>
                {isLoading ? (
                  <SkeletonLoader width='250px' height='20px' />
                ) : (
                  <>
                    <h1 className='text-sm font-medium text-gray-900 leading-5'>
                      {questionnaire.name}
                    </h1>
                    {renderStatusBadge()}
                  </>
                )}
              </div>
              <p className='text-xs text-gray-500 leading-4'>
                You can generate answers with our AI or edit them manually. Once you&apos;re done,
                simply mark each answer as approved.
              </p>
            </div>

            <div className='flex items-center gap-1.5'>
              {onStatusChange && (
                <QuestionnaireStatusDropdown
                  currentStatus={questionnaire.status || 'in_progress'}
                  onStatusChange={onStatusChange}
                />
              )}
              <button
                onClick={onExport}
                className='bg-white border border-gray-300 text-gray-700 px-3 py-[7px] rounded text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer'
              >
                <Download className='h-4 w-4' />
                Export
              </button>
            </div>
          </div>

          {totalCount > 0 && <ApprovalProgress approved={approvedCount} total={totalCount} />}
        </div>
      </div>

      <div className='flex items-center justify-between w-full gap-4'>
        <div className='w-64 flex-shrink-0'>
          <SearchField placeholder='Search' value={searchTerm} onChange={onSearchChange} />
        </div>

        {/* Generate with Secfix Agent button */}
        {totalCount > 0 && onGenerateAnswers && (
          <button
            onClick={onGenerateAnswers}
            disabled={isGenerating}
            className='bg-white border border-gray-300 text-gray-700 px-3 py-[7px] rounded text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
          >
            {isGenerating && generationProgress ? (
              <>
                <ApprovalStatusIcon
                  approved={generationProgress.completed}
                  total={generationProgress.total}
                  size={16}
                />
                Agent generating answers...
              </>
            ) : (
              <>
                <Sparkles className='h-4 w-4 text-violet-600' />
                Generate with Secfix Agent
              </>
            )}
          </button>
        )}
      </div>

      {children}
    </div>
  );
};

export default QuestionnaireDetailView;
