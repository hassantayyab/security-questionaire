'use client';

import AIGenerationProgress from '@/components/AIGenerationProgress';
import SearchField from '@/components/SearchField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Questionnaire } from '@/types';
import { Clock, Download, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface QuestionnaireDetailViewProps {
  questionnaire: Questionnaire;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onExport: () => void;
  approvedCount: number;
  answeredCount: number;
  totalCount: number;
  isGenerating?: boolean;
  generationProgress?: {
    completed: number;
    total: number;
  } | null;
  onGenerateAnswers?: () => void;
  onStopGeneration?: () => void;
  children?: ReactNode;
}

const QuestionnaireDetailView = ({
  questionnaire,
  searchTerm,
  onSearchChange,
  onBack,
  onExport,
  approvedCount,
  answeredCount,
  totalCount,
  isGenerating = false,
  generationProgress = null,
  onGenerateAnswers,
  onStopGeneration,
  children,
}: QuestionnaireDetailViewProps) => {
  const isCompleted = totalCount > 0 && approvedCount === totalCount;

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
                <h1 className='text-sm font-medium text-gray-900 leading-5'>
                  {questionnaire.name}
                </h1>
                {isCompleted ? (
                  <Badge variant='approved' className='rounded-[10px] px-2.5'>
                    Completed
                  </Badge>
                ) : (
                  <Badge variant='pending'>
                    <Clock className='w-[11.2px] h-[11.2px]' />
                    In progress
                  </Badge>
                )}
              </div>
              <p className='text-xs text-gray-500 leading-4'>
                You can generate answers with our AI or edit them manually. Once you&apos;re done,
                simply mark each answer as approved.
              </p>
            </div>

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

      <div className='flex items-center justify-between w-full gap-4'>
        <div className='w-64 flex-shrink-0'>
          <SearchField placeholder='Search' value={searchTerm} onChange={onSearchChange} />
        </div>

        <div className='flex items-center gap-3 flex-shrink-0'>
          {/* Show Generate button ONLY when not generating and no generation has started */}
          {totalCount > 0 && onGenerateAnswers && !isGenerating && !generationProgress && (
            <Button
              onClick={onGenerateAnswers}
              className='gap-2 bg-violet-600 text-white hover:bg-violet-600/90 focus:ring-violet-600/20 transition-colors cursor-pointer'
            >
              <Sparkles className='w-4 h-4' />
              Generate with AI
            </Button>
          )}

          {/* Show Stop button when actively generating */}
          {isGenerating && onStopGeneration && (
            <Button
              variant='outline'
              onClick={onStopGeneration}
              className='gap-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20 transition-colors cursor-pointer'
            >
              <X className='w-4 h-4' />
              Stop Generation
            </Button>
          )}

          {/* Show progress bar when generating or when generation has been started */}
          {totalCount > 0 && generationProgress && (
            <div className='flex-shrink-0'>
              <AIGenerationProgress
                completed={generationProgress.completed}
                total={generationProgress.total}
              />
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

export default QuestionnaireDetailView;
