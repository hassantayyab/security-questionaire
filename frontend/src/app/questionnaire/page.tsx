'use client';

import { AppLayout, LoadingSpinner } from '@/components';
import AppButton from '@/components/AppButton';
import QuestionnairesTable from '@/components/QuestionnairesTable';
import SearchField from '@/components/SearchField';
import { ExcelUploadDialog } from '@/components/dialogs';
import { api, ApiError } from '@/lib/api';
import { Questionnaire } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function QuestionnairePage() {
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestionnaireRows, setSelectedQuestionnaireRows] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      setIsLoading(true);
      const response = await api.getQuestionnaires();
      if (response.success) {
        setQuestionnaires(response.questionnaires || []);
      }
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      toast.error('Failed to load questionnaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionnaireRowSelect = (id: string) => {
    const newSelection = new Set(selectedQuestionnaireRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedQuestionnaireRows(newSelection);
  };

  const handleQuestionnaireSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedQuestionnaireRows(new Set(questionnaires.map((q) => q.id)));
    } else {
      setSelectedQuestionnaireRows(new Set());
    }
  };

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    // Navigate to questionnaire detail page
    router.push(`/questionnaire/${questionnaire.id}`);
  };

  const handleDeleteQuestionnaire = async (questionnaire: Questionnaire) => {
    if (
      !confirm(
        `Are you sure you want to delete '${questionnaire.name}' and all its questions? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await api.deleteQuestionnaire(questionnaire.id);

      if (response.success) {
        toast.success(response.message);
        setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaire.id));
      } else {
        toast.error('Failed to delete questionnaire');
      }
    } catch (error) {
      console.error('Delete questionnaire error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete questionnaire. Please try again.');
      }
    }
  };

  // Filter questionnaires based on search term
  const filteredQuestionnaires = questionnaires.filter((questionnaire) =>
    questionnaire.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className='p-6 space-y-4'>
        {/* Page Header */}
        <div className='space-y-1'>
          <h1 className='text-base font-semibold text-gray-900'>Questionnaires</h1>
          <p className='text-xs text-gray-500'>Upload your questionnaire document</p>
        </div>

        {/* Search and Upload Section */}
        <div className='flex items-center justify-between w-full'>
          <div className='w-64'>
            <SearchField placeholder='Search' value={searchTerm} onChange={setSearchTerm} />
          </div>
          <ExcelUploadDialog
            onUploadSuccess={async () => {
              // Reload questionnaires after Excel upload
              await loadQuestionnaires();
            }}
          >
            <AppButton variant='primary' size='sm'>
              Import questionnaire
            </AppButton>
          </ExcelUploadDialog>
        </div>

        {/* Questionnaires Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredQuestionnaires.length > 0 ? (
          <QuestionnairesTable
            data={filteredQuestionnaires}
            selectedRows={selectedQuestionnaireRows}
            onRowSelect={handleQuestionnaireRowSelect}
            onSelectAll={handleQuestionnaireSelectAll}
            onView={handleViewQuestionnaire}
            onDelete={handleDeleteQuestionnaire}
          />
        ) : questionnaires.length === 0 ? (
          <div className='text-center space-y-3 py-12'>
            <div className='text-lg font-medium text-gray-500'>No questionnaires found</div>
            <div className='text-sm text-gray-500'>
              Upload an Excel questionnaire to get started
            </div>
          </div>
        ) : (
          <div className='text-center space-y-3 py-12'>
            <div className='text-lg font-medium text-gray-500'>
              No questionnaires match your search
            </div>
            <div className='text-sm text-gray-500'>
              Try adjusting your search term or clear the search to see all questionnaires
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
