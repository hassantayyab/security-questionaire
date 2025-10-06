'use client';

import AnswersLibraryTable from '@/components/AnswersLibraryTable';
import SearchField from '@/components/SearchField';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Answer } from '@/types';
import { FileText, Import, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AnswersLibraryProps {
  onCountChange?: (count: number) => void;
}

const AnswersLibrary = ({ onCountChange }: AnswersLibraryProps) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [viewingAnswer, setViewingAnswer] = useState<Answer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - Replace with actual API call
  useEffect(() => {
    const mockAnswers: Answer[] = [
      {
        id: '1',
        question:
          'Acceptable use of information and other associated assets and longer title for testing',
        answer:
          'Acceptable use of information and other associated assets and longer title for testing',
        source: {
          type: 'user',
          name: 'Joe Doe',
        },
        last_updated: '2025-09-25T10:30:00Z',
        created_at: '2025-09-25T10:30:00Z',
        updated_at: '2025-09-25T10:30:00Z',
      },
      {
        id: '2',
        question: 'Do you have a physical office?',
        answer: 'Yes',
        source: {
          type: 'questionnaire',
          name: 'RFP-2025-21',
        },
        last_updated: '2025-09-25T10:30:00Z',
        created_at: '2025-09-25T10:30:00Z',
        updated_at: '2025-09-25T10:30:00Z',
      },
      {
        id: '3',
        question: "What is your company's data retention policy?",
        answer:
          'We retain data for 7 years in accordance with legal requirements and industry best practices.',
        source: {
          type: 'user',
          name: 'Jane Smith',
        },
        last_updated: '2025-09-24T14:20:00Z',
        created_at: '2025-09-24T14:20:00Z',
        updated_at: '2025-09-24T14:20:00Z',
      },
      {
        id: '4',
        question: 'How do you handle security incidents?',
        answer:
          'We have a comprehensive incident response plan that includes detection, containment, investigation, and remediation procedures.',
        source: {
          type: 'questionnaire',
          name: 'ISO-27001-2024',
        },
        last_updated: '2025-09-23T09:15:00Z',
        created_at: '2025-09-23T09:15:00Z',
        updated_at: '2025-09-23T09:15:00Z',
      },
      {
        id: '5',
        question: 'Do you conduct regular security training for employees?',
        answer:
          'Yes, all employees undergo mandatory security awareness training annually and phishing simulations quarterly.',
        source: {
          type: 'user',
          name: 'Mike Johnson',
        },
        last_updated: '2025-09-22T16:45:00Z',
        created_at: '2025-09-22T16:45:00Z',
        updated_at: '2025-09-22T16:45:00Z',
      },
    ];

    setAnswers(mockAnswers);
  }, []);

  // Notify parent component when answers count changes
  useEffect(() => {
    onCountChange?.(answers.length);
  }, [answers.length, onCountChange]);

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(filteredAnswers.map((a) => a.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleDeleteAnswer = (answer: Answer) => {
    if (!confirm(`Are you sure you want to delete this answer? This action cannot be undone.`)) {
      return;
    }

    // Remove the answer from the list
    setAnswers(answers.filter((a) => a.id !== answer.id));
    toast.success('Answer deleted successfully');
  };

  const handleAddAnswer = () => {
    toast.info('Add answer dialog - Coming soon!');
  };

  const handleImportQuestionnaire = () => {
    toast.info('Import questionnaire dialog - Coming soon!');
  };

  // Filter answers based on search term
  const filteredAnswers = answers.filter(
    (answer) =>
      answer.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='space-y-4'>
      {/* Search and Action Buttons Section */}
      <div className='flex items-center justify-between w-full pt-4'>
        <div className='w-64'>
          <SearchField placeholder='Search' value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className='flex items-center gap-4'>
          {/* Add Answer Button */}
          <button
            onClick={handleAddAnswer}
            className='bg-white border border-gray-300 text-gray-700 px-3 py-[7px] rounded text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer'
          >
            <Plus className='h-4 w-4' />
            Add answer
          </button>

          {/* Import Questionnaire Button */}
          <button
            onClick={handleImportQuestionnaire}
            className='bg-violet-600 border border-violet-600 text-white px-3 py-[7px] rounded text-xs font-medium hover:bg-violet-700 transition-colors flex items-center gap-1.5 cursor-pointer'
          >
            <Import className='h-4 w-4' />
            Import questionnaire
          </button>
        </div>
      </div>

      {/* Answers List */}
      {answers.length === 0 ? (
        <div className='text-center py-8 space-y-3'>
          <FileText className='w-12 h-12 text-gray-500 mx-auto' />
          <div className='text-base font-medium text-gray-500'>No answers available</div>
          <div className='text-sm text-gray-500'>
            Add your first answer or import a questionnaire to get started
          </div>
        </div>
      ) : filteredAnswers.length === 0 ? (
        <div className='text-center py-8 space-y-3'>
          <div className='text-base font-medium text-gray-500'>No answers match your search</div>
          <div className='text-sm text-gray-500'>
            Try adjusting your search term or clear the search to see all answers
          </div>
        </div>
      ) : (
        <AnswersLibraryTable
          data={filteredAnswers}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onView={(answer) => setViewingAnswer(answer)}
          onDelete={handleDeleteAnswer}
        />
      )}

      {/* Answer Preview Dialog */}
      {viewingAnswer && (
        <Dialog open={!!viewingAnswer} onOpenChange={() => setViewingAnswer(null)}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                Answer Details
              </DialogTitle>
              <DialogDescription>View the complete answer and its details</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              {/* Question */}
              <div>
                <label className='text-sm font-medium text-gray-900 block mb-2'>Question</label>
                <div className='text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200'>
                  {viewingAnswer.question}
                </div>
              </div>

              {/* Answer */}
              <div>
                <label className='text-sm font-medium text-gray-900 block mb-2'>Answer</label>
                <div className='text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap'>
                  {viewingAnswer.answer}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className='text-sm font-medium text-gray-900 block mb-2'>Source</label>
                <div className='text-sm text-gray-700'>
                  {viewingAnswer.source.type === 'user' ? 'User: ' : 'Questionnaire: '}
                  {viewingAnswer.source.name}
                </div>
              </div>

              {/* Last Updated */}
              <div>
                <label className='text-sm font-medium text-gray-900 block mb-2'>Last Updated</label>
                <div className='text-sm text-gray-700'>
                  {new Date(viewingAnswer.last_updated).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnswersLibrary;
