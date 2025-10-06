'use client';

import AnswersLibraryTable from '@/components/AnswersLibraryTable';
import SearchField from '@/components/SearchField';
import { AddAnswerDialog, ImportQuestionnaireDialog } from '@/components/dialogs';
import { api } from '@/lib/api';
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
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch answers from backend on mount
  useEffect(() => {
    fetchAnswers();
  }, []);

  // Notify parent component when answers count changes
  useEffect(() => {
    onCountChange?.(answers.length);
  }, [answers.length, onCountChange]);

  const fetchAnswers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAnswers();

      if (response.success) {
        setAnswers(response.answers);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
      toast.error('Failed to load answers');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeleteAnswer = async (answer: Answer) => {
    if (!confirm(`Are you sure you want to delete this answer? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.deleteAnswerLibrary(answer.id);

      if (response.success) {
        setAnswers(answers.filter((a) => a.id !== answer.id));
        toast.success('Answer deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error('Failed to delete answer');
    }
  };

  const handleAddAnswer = () => {
    setEditingAnswer(null);
    setIsDialogOpen(true);
  };

  const handleEditAnswer = (answer: Answer) => {
    setEditingAnswer(answer);
    setIsDialogOpen(true);
  };

  const handleSaveAnswer = async (question: string, answer: string, answerId?: string) => {
    try {
      if (answerId) {
        // Update existing answer
        const response = await api.updateAnswerLibrary(answerId, question, answer);

        if (response.success && response.answer) {
          setAnswers(answers.map((a) => (a.id === answerId ? response.answer : a)));
          toast.success('Answer updated successfully');
        }
      } else {
        // Create new answer
        const response = await api.createAnswer(question, answer);

        if (response.success && response.answer) {
          setAnswers([response.answer, ...answers]);
          toast.success('Answer added successfully');
        }
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error(answerId ? 'Failed to update answer' : 'Failed to add answer');
    }
  };

  const handleImportQuestionnaire = () => {
    setIsImportDialogOpen(true);
  };

  const handleBulkImport = async (answersToImport: Array<{ question: string; answer: string }>) => {
    try {
      const response = await api.bulkImportAnswers(answersToImport);

      if (response.success) {
        // Refresh the answers list
        await fetchAnswers();
        toast.success(
          `Successfully imported ${response.success_count} answer${
            response.success_count === 1 ? '' : 's'
          }`,
        );

        if (response.error_count > 0) {
          toast.warning(
            `${response.error_count} row${
              response.error_count === 1 ? '' : 's'
            } could not be imported`,
          );
        }
      }
    } catch (error) {
      console.error('Error importing answers:', error);
      toast.error('Failed to import answers');
      throw error;
    }
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
      {isLoading ? (
        <div className='text-center py-8 space-y-3'>
          <div className='text-base font-medium text-gray-500'>Loading answers...</div>
        </div>
      ) : answers.length === 0 ? (
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
          onEdit={handleEditAnswer}
          onDelete={handleDeleteAnswer}
        />
      )}

      {/* Add/Edit Answer Dialog */}
      <AddAnswerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveAnswer}
        editAnswer={editingAnswer}
      />

      {/* Import Questionnaire Dialog */}
      <ImportQuestionnaireDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleBulkImport}
      />
    </div>
  );
};

export default AnswersLibrary;
