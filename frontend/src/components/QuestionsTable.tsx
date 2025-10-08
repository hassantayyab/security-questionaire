'use client';

import SkeletonLoader from '@/components/SkeletonLoader';
import { GenericTable, TableAction, TableColumn, TableInlineAction } from '@/components/tables';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';
import { Check, ClipboardCopy, Edit, RefreshCw, Sparkles, Undo2, User, X } from 'lucide-react';
import { ReactNode } from 'react';

interface QuestionsTableProps {
  data: Question[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (question: Question) => void;
  onApprove: (question: Question) => void;
  onUnapprove: (question: Question) => void;
  onDelete: (question: Question) => void;
  onGenerateAI: (question: Question) => void;
  onRegenerateAI: (question: Question) => void;
  editingQuestionId?: string | null;
  editingAnswer?: string;
  onEditAnswerChange?: (value: string) => void;
  onSaveAnswer?: (questionId: string) => void;
  onCancelEdit?: () => void;
  generatingQuestionIds?: Set<string>;
}

const QuestionsTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onEdit,
  onApprove,
  onUnapprove,
  onDelete,
  onGenerateAI,
  onRegenerateAI,
  editingQuestionId,
  editingAnswer,
  onEditAnswerChange,
  onSaveAnswer,
  onCancelEdit,
  generatingQuestionIds = new Set(),
}: QuestionsTableProps) => {
  // Format date as DD.MM.YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Render answer source indicator with tooltip
  const renderAnswerWithSource = (question: Question): ReactNode => {
    // Check if this question is currently being generated
    const isGenerating = generatingQuestionIds.has(question.id);

    // Show skeleton loader with sparkles icon if generating
    if (isGenerating) {
      return (
        <div className='flex items-start gap-2'>
          <Sparkles className='w-3.5 h-3.5 text-violet-600 flex-shrink-0 mt-[2px]' />
          <div className='flex flex-col gap-2 py-[2px] flex-1'>
            <SkeletonLoader width='100%' height='16px' />
            <SkeletonLoader width='80%' height='16px' />
          </div>
        </div>
      );
    }

    // Check if this question is being edited
    const isEditing = editingQuestionId === question.id;

    // If editing, show textarea with save/cancel buttons
    if (isEditing) {
      return (
        <div className='flex items-center gap-2 mx-auto'>
          <textarea
            value={editingAnswer}
            onChange={(e) => onEditAnswerChange?.(e.target.value)}
            className='flex-1 min-h-[45px] px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all ml-2.5 -my-1'
            placeholder='Enter answer...'
            autoFocus
            rows={2}
          />
          <div className='flex items-center gap-3'>
            <button
              onClick={() => onSaveAnswer?.(question.id)}
              className='w-[30px] h-[30px] border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Save answer'
            >
              <Check className='w-4 h-4 text-gray-600' />
            </button>
            <button
              onClick={() => onCancelEdit?.()}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Cancel editing'
            >
              <X className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      );
    }

    const hasAnswer = question.answer && question.answer.trim();

    if (!hasAnswer) {
      // No answer - show dash and action buttons on hover
      return (
        <div className='flex items-center gap-2 group'>
          <div className='h-[2px] w-3 bg-gray-900' />
          <div className='flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={() => onGenerateAI(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Generate AI answer'
            >
              <Sparkles className='w-4 h-4 text-gray-600' />
            </button>
            <button
              onClick={() => onEdit(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Edit answer'
            >
              <Edit className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      );
    }

    // Determine answer source and render accordingly
    const answerSource = question.answer_source;

    if (answerSource === 'ai') {
      // AI generated answer
      return (
        <div className='flex items-center gap-2 group'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
            <Sparkles className='w-3.5 h-3.5 text-violet-600 flex-shrink-0' />
            <span className='text-sm text-gray-900 leading-5 line-clamp-2 flex-1'>
              {question.answer}
            </span>
          </div>
          <div className='flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={() => onRegenerateAI(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Regenerate AI answer'
            >
              <RefreshCw className='w-4 h-4 text-gray-600' />
            </button>
            <button
              onClick={() => onEdit(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Edit answer'
            >
              <Edit className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      );
    }

    if (answerSource === 'not_found') {
      // AI couldn't find answer
      return (
        <div className='flex items-center gap-2'>
          <Sparkles className='w-3.5 h-3.5 text-violet-600 flex-shrink-0' />
          <span className='text-sm text-gray-500 italic leading-5'>
            AI could not find an answer
          </span>
        </div>
      );
    }

    if (answerSource === 'user') {
      // User added answer
      return (
        <div className='flex items-center gap-2 group'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
            <User className='w-3.5 h-3.5 text-gray-600 flex-shrink-0' />
            <span className='text-sm text-gray-900 leading-5 line-clamp-2 flex-1'>
              {question.answer}
            </span>
          </div>
          <div className='flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={() => onGenerateAI(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Generate AI answer'
            >
              <Sparkles className='w-4 h-4 text-gray-600' />
            </button>
            <button
              onClick={() => onEdit(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Edit answer'
            >
              <Edit className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      );
    }

    if (answerSource === 'copied') {
      // Copied from previous questionnaire
      return (
        <div className='flex items-center gap-2 group'>
          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
            <ClipboardCopy className='w-3.5 h-3.5 text-gray-600 flex-shrink-0' />
            <span className='text-sm text-gray-900 leading-5 line-clamp-2 flex-1'>
              {question.answer}
            </span>
          </div>
          <div className='flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={() => onGenerateAI(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Generate AI answer'
            >
              <Sparkles className='w-4 h-4 text-gray-600' />
            </button>
            <button
              onClick={() => onEdit(question)}
              className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
              title='Edit answer'
            >
              <Edit className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      );
    }

    // Default: just show answer text
    return <span className='text-sm text-gray-900 leading-5 line-clamp-2'>{question.answer}</span>;
  };

  const columns: TableColumn<Question>[] = [
    {
      key: 'question_text',
      header: 'Question',
      width: '32%', // Flexible width to fill available space
      render: (question) => (
        <span className='text-sm text-gray-900 leading-5 line-clamp-2'>
          {question.question_text}
        </span>
      ),
    },
    {
      key: 'answer',
      header: 'Answer',
      width: '32%', // Flexible width to fill available space
      render: renderAnswerWithSource,
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '68px',
      render: () => {
        // Display owner avatar
        return (
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center'>
              <span className='text-xs font-medium text-gray-600'>?</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (question) => {
        const isApproved = question.status === 'approved';
        return (
          <Badge variant={isApproved ? 'approved' : 'pending'}>
            {isApproved ? 'Approved' : 'Needs approval'}
          </Badge>
        );
      },
    },
    {
      key: 'updated_at',
      header: 'Last updated',
      width: '110px',
      render: (question) => (
        <span className='text-sm text-gray-900 whitespace-nowrap'>
          {formatDate(question.updated_at)}
        </span>
      ),
    },
  ];

  const inlineActions: TableInlineAction<Question>[] = [
    {
      key: 'approve',
      icon: <Check className='w-4 h-4 text-gray-600' />,
      onClick: onApprove,
      title: 'Approve answer',
      show: (question) => question.status !== 'approved',
    },
    {
      key: 'unapprove',
      icon: <Undo2 className='w-4 h-4 text-gray-600' />,
      onClick: onUnapprove,
      title: 'Unapprove answer',
      show: (question) => question.status === 'approved',
    },
  ];

  const actions: TableAction<Question>[] = [
    {
      label: 'Edit',
      onClick: onEdit,
    },
    {
      label: 'Delete',
      onClick: onDelete,
    },
  ];

  return (
    <GenericTable
      data={data}
      columns={columns}
      actions={actions}
      inlineActions={inlineActions}
      selectedRows={selectedRows}
      onRowSelect={onRowSelect}
      onSelectAll={onSelectAll}
      getRowId={(question) => question.id}
      itemsPerPage={10}
      showCheckbox={true}
    />
  );
};

export default QuestionsTable;
