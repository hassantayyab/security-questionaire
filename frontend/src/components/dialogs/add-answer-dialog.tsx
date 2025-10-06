'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { StandardDialog } from './standard-dialog';

interface AddAnswerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: string, answer: string) => void;
}

export const AddAnswerDialog = ({ open, onOpenChange, onSave }: AddAnswerDialogProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSave = () => {
    // Validate inputs
    if (!question.trim() || !answer.trim()) {
      return;
    }

    onSave(question, answer);
    handleClose();
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    onOpenChange(false);
  };

  const isSaveDisabled = !question.trim() || !answer.trim();

  return (
    <StandardDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Add answer'
      description='Add a new question and answer to your answers library'
      onCancel={handleClose}
      onAction={handleSave}
      actionDisabled={isSaveDisabled}
      actionLabel='Save'
      cancelLabel='Cancel'
    >
      <div className='space-y-6'>
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
