'use client';

import { GenericTable, TableAction, TableColumn } from '@/components/tables';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types';
import { Check, ClipboardCopy, Edit, RefreshCw, Sparkles, User, X } from 'lucide-react';
import { ReactNode } from 'react';

interface QuestionsTableProps {
  data: Question[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (question: Question) => void;
  onApprove: (question: Question) => void;
  onUnapprove: (question: Question) => void;
  onGenerateAI: (question: Question) => void;
  onRegenerateAI: (question: Question) => void;
  editingQuestionId?: string | null;
  editingAnswer?: string;
  onEditAnswerChange?: (value: string) => void;
  onSaveAnswer?: (questionId: string) => void;
  onCancelEdit?: () => void;
}

const QuestionsTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onEdit,
  onApprove,
  onUnapprove,
  onGenerateAI,
  onRegenerateAI,
  editingQuestionId,
  editingAnswer,
  onEditAnswerChange,
  onSaveAnswer,
  onCancelEdit,
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
    // Check if this question is being edited
    const isEditing = editingQuestionId === question.id;

    // If editing, show textarea with save/cancel buttons
    if (isEditing) {
      return (
        <div className='flex items-center gap-2 w-full'>
          <textarea
            value={editingAnswer}
            onChange={(e) => onEditAnswerChange?.(e.target.value)}
            className='flex-1 min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all'
            placeholder='Enter answer...'
            autoFocus
          />
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onSaveAnswer?.(question.id)}
              className='w-[30px] h-[30px] border border-green-600 rounded bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer'
              title='Save answer'
            >
              <Check className='w-4 h-4 text-green-600' />
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
        <div className='flex items-center gap-2'>
          <User className='w-3.5 h-3.5 text-gray-600 flex-shrink-0' />
          <span className='text-sm text-gray-900 leading-5 line-clamp-2 flex-1'>N/A</span>
        </div>
      );
    }

    if (answerSource === 'copied') {
      // Copied from previous questionnaire
      return (
        <div className='flex items-center gap-2'>
          <ClipboardCopy className='w-3.5 h-3.5 text-gray-600 flex-shrink-0' />
          <span className='text-sm text-gray-900 leading-5 line-clamp-2 flex-1'>No</span>
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
      width: '240px',
      render: (question) => (
        <span className='text-sm text-gray-900 leading-5 line-clamp-2'>
          {question.question_text}
        </span>
      ),
    },
    {
      key: 'answer',
      header: 'Answer',
      width: '232px',
      render: renderAnswerWithSource,
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '68px',
      render: (question) => {
        // Display owner avatar
        return (
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center'>
              <span className='text-xs font-medium text-violet-600'>
                {question.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
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
      width: '100px',
      render: (question) => (
        <span className='text-sm text-gray-900 whitespace-nowrap'>
          {formatDate(question.updated_at)}
        </span>
      ),
    },
  ];

  const actions: TableAction<Question>[] = [
    {
      label: 'Approve',
      onClick: onApprove,
    },
    {
      label: 'Unapprove',
      onClick: onUnapprove,
    },
    {
      label: 'Edit',
      onClick: onEdit,
    },
  ];

  return (
    <GenericTable
      data={data}
      columns={columns}
      actions={actions}
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
