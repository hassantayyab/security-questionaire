'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Answer } from '@/types';
import { useEffect, useState } from 'react';
import { StandardDialog } from './standard-dialog';

interface AddAnswerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: string, answer: string, answerId?: string) => void;
  editAnswer?: Answer | null;
}

export const AddAnswerDialog = ({
  open,
  onOpenChange,
  onSave,
  editAnswer,
}: AddAnswerDialogProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const isEditMode = !!editAnswer;

  // Pre-fill form when editing
  useEffect(() => {
    if (editAnswer) {
      setQuestion(editAnswer.question);
      setAnswer(editAnswer.answer);
    } else {
      setQuestion('');
      setAnswer('');
    }
  }, [editAnswer, open]);

  const handleSave = () => {
    // Validate inputs
    if (!question.trim() || !answer.trim()) {
      return;
    }

    onSave(question, answer, editAnswer?.id);
    handleClose();
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    onOpenChange(false);
  };

  const isSaveDisabled = !question.trim() || !answer.trim();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StandardDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit answer' : 'Add answer'}
      description={
        isEditMode
          ? 'Edit the question and answer in your answers library'
          : 'Add a new question and answer to your answers library'
      }
      onCancel={handleClose}
      onAction={handleSave}
      actionDisabled={isSaveDisabled}
      actionLabel='Save'
      cancelLabel='Cancel'
    >
      <div className='space-y-6'>
        {/* Show metadata in edit mode */}
        {isEditMode && editAnswer && (
          <div className='space-y-3 pb-3 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-gray-500'>Source</span>
              <span className='text-xs text-gray-900'>
                {editAnswer.source_type === 'user' ? 'User: ' : 'Questionnaire: '}
                {editAnswer.source_name}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-gray-500'>Added</span>
              <span className='text-xs text-gray-900'>{formatDate(editAnswer.created_at)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-gray-500'>Last updated</span>
              <span className='text-xs text-gray-900'>{formatDate(editAnswer.updated_at)}</span>
            </div>
          </div>
        )}

        {/* Question Field */}
        <div className='space-y-1'>
          <Label htmlFor='question' className='text-xs font-medium text-gray-700 leading-4 block'>
            Question
          </Label>
          <Input
            id='question'
            type='text'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder=''
            className='w-full border-gray-200 shadow-xs text-sm focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 transition-all duration-200'
          />
        </div>

        {/* Answer Field */}
        <div className='space-y-1'>
          <Label htmlFor='answer' className='text-xs font-medium text-gray-700 leading-4 block'>
            Answer
          </Label>
          <Textarea
            id='answer'
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder=''
            className='w-full border-gray-200 shadow-xs text-sm min-h-[100px] resize-none focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 transition-all duration-200'
            rows={4}
          />
        </div>
      </div>
    </StandardDialog>
  );
};
