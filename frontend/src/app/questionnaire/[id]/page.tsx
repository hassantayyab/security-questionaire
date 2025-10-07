'use client';

import { AppLayout, BannerActionButton, LoadingSpinner, MultiSelectBanner } from '@/components';
import QuestionnaireDetailView from '@/components/QuestionnaireDetailView';
import QuestionsTable from '@/components/QuestionsTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { api, ApiError } from '@/lib/api';
import { GenerateAnswersResponse, Question, Questionnaire } from '@/types';
import { HelpCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function QuestionnaireDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    total: number;
    completed: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isGeneratingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    loadQuestionnaire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (questionnaire) {
      loadQuestions(questionnaire.id);
    }
  }, [questionnaire]);

  // Update generation progress whenever questions change to show current state
  useEffect(() => {
    if (questions.length > 0) {
      const answeredCount = questions.filter(
        (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
      ).length;

      // Always show progress if there are questions, even when not actively generating
      setGenerationProgress({
        total: questions.length,
        completed: answeredCount,
      });
    } else {
      setGenerationProgress(null);
    }
  }, [questions]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const loadQuestionnaire = async () => {
    try {
      setIsLoading(true);
      const response = await api.getQuestionnaires();
      if (response.success) {
        const found = response.questionnaires?.find((q: Questionnaire) => q.id === id);
        if (found) {
          setQuestionnaire(found);
        } else {
          toast.error('Questionnaire not found');
          router.push('/questionnaire');
        }
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      toast.error('Failed to load questionnaire');
      router.push('/questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async (questionnaireId: string) => {
    try {
      setIsLoadingQuestions(true);
      const response = await api.getQuestions(questionnaireId);
      if (response.success) {
        const newQuestions = response.questions || [];
        setQuestions(newQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const startPolling = (questionnaireId: string, totalQuestions: number) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setGenerationProgress((prev) => ({
      total: totalQuestions,
      completed: prev?.completed || 0,
    }));

    const interval = setInterval(() => {
      loadQuestions(questionnaireId);
    }, 2000);

    setPollingInterval(interval);

    setTimeout(() => {
      if (pollingInterval) {
        stopPolling(true);
        toast.warning('Answer generation timed out. Some answers may still be processing.');
      }
    }, 10 * 60 * 1000);
  };

  const stopPolling = useCallback(
    (clearProgressImmediately = false) => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setIsGenerating(false);

      if (clearProgressImmediately) {
        setGenerationProgress(null);
      } else {
        setTimeout(() => {
          setGenerationProgress(null);
        }, 2000);
      }
    },
    [pollingInterval],
  );

  // Check if generation is complete during polling
  useEffect(() => {
    if (isGeneratingRef.current && questions.length > 0) {
      const questionsWithAnswers = questions.filter(
        (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
      ).length;

      // Check if all questions have been answered
      if (questionsWithAnswers === questions.length && questionsWithAnswers > 0) {
        stopPolling(false);
        toast.success(`All ${questionsWithAnswers} answers have been generated!`);
      }
    }
  }, [questions, stopPolling]);

  const handleGenerateAnswers = async () => {
    if (!questionnaire) return;

    const initialCompleted = questions.filter(
      (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
    ).length;

    setIsGenerating(true);

    setGenerationProgress({
      total: questions.length,
      completed: initialCompleted,
    });

    try {
      const response: GenerateAnswersResponse = await api.generateAnswers(questionnaire.id);

      if (response.success) {
        if (response.status === 'processing') {
          toast.success(response.message, {
            description: 'Watch the progress below as answers are generated in real-time!',
            duration: 5000,
          });

          // Start polling for real-time updates
          const totalToGenerate = response.total_questions || questions.length;
          startPolling(questionnaire.id, totalToGenerate);
        } else {
          toast.success(`Generated answers for ${response.generated_count || 0} questions`);

          if (response.errors && response.errors.length > 0) {
            toast.warning(`${response.errors.length} questions had errors`);
          }

          await loadQuestions(questionnaire.id);
          setIsGenerating(false);
          setGenerationProgress(null);
        }
      } else {
        toast.error('Failed to start answer generation');
        setIsGenerating(false);
        setGenerationProgress(null);
      }
    } catch (error) {
      console.error('Generate answers error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start answer generation. Please try again.');
      }
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingAnswer(question.answer || '');
  };

  const saveAnswer = async (questionId: string) => {
    try {
      await api.updateAnswer(questionId, editingAnswer);
      toast.success('Answer updated');

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answer: editingAnswer, status: 'unapproved' as const } : q,
        ),
      );

      setEditingQuestionId(null);
      setEditingAnswer('');
    } catch (error) {
      console.error('Save answer error:', error);
      toast.error('Failed to save answer');
    }
  };

  const toggleApproval = async (questionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'unapproved' : 'approved';

      if (newStatus === 'approved') {
        await api.approveAnswer(questionId);
      } else {
        await api.updateAnswer(
          questionId,
          questions.find((q) => q.id === questionId)?.answer || '',
          'unapproved',
        );
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, status: newStatus as 'approved' | 'unapproved' } : q,
        ),
      );

      toast.success(`Answer ${newStatus}`);
    } catch (error) {
      console.error('Toggle approval error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    if (!questionnaire) return;

    try {
      const response = await api.exportAnswers(questionnaire.id);

      if (response.success && response.approved_questions) {
        const csvContent = [
          ['Question', 'Answer'],
          ...response.export_data.map((item: any) => [item.question, item.answer]),
        ]
          .map((row) => row.map((cell: any) => `'${cell.replace(/'/g, "''")}'`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${questionnaire.name}_answers.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Export completed');
      } else {
        toast.error('No approved answers found for export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export answers');
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestions);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedQuestions(newSelection);
  };

  const handleBackToList = () => {
    router.push('/questionnaire');
  };

  const handleGenerateSingleAnswer = async (question: Question) => {
    toast.info('Generating AI answer for this question...');
  };

  const handleRegenerateAnswer = async (question: Question) => {
    toast.info('Regenerating AI answer...');
  };

  const handleBulkApprove = async () => {
    const selectedQuestionsList = questions.filter((q) => selectedQuestions.has(q.id));
    const unapprovedQuestions = selectedQuestionsList.filter((q) => q.status !== 'approved');

    if (unapprovedQuestions.length === 0) {
      toast.info('All selected questions are already approved');
      return;
    }

    try {
      await Promise.all(unapprovedQuestions.map((q) => api.approveAnswer(q.id)));

      setQuestions((prev) =>
        prev.map((q) => (selectedQuestions.has(q.id) ? { ...q, status: 'approved' as const } : q)),
      );

      toast.success(
        `Approved ${unapprovedQuestions.length} answer${
          unapprovedQuestions.length !== 1 ? 's' : ''
        }`,
      );
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error('Bulk approve error:', error);
      toast.error('Failed to approve some answers');
    }
  };

  const handleBulkUnapprove = async () => {
    const selectedQuestionsList = questions.filter((q) => selectedQuestions.has(q.id));
    const approvedQuestions = selectedQuestionsList.filter((q) => q.status === 'approved');

    if (approvedQuestions.length === 0) {
      toast.info('None of the selected questions are approved');
      return;
    }

    try {
      await Promise.all(
        approvedQuestions.map((q) => api.updateAnswer(q.id, q.answer || '', 'unapproved')),
      );

      setQuestions((prev) =>
        prev.map((q) =>
          selectedQuestions.has(q.id) ? { ...q, status: 'unapproved' as const } : q,
        ),
      );

      toast.success(
        `Unapproved ${approvedQuestions.length} answer${approvedQuestions.length !== 1 ? 's' : ''}`,
      );
      setSelectedQuestions(new Set());
    } catch (error) {
      console.error('Bulk unapprove error:', error);
      toast.error('Failed to unapprove some answers');
    }
  };

  const handleBulkDelete = async () => {
    toast.info('Bulk delete functionality coming soon');
    // TODO: Implement bulk delete when API endpoint is available
  };

  const handleClearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const filteredQuestions = questions.filter((question) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const questionMatch = question.question_text.toLowerCase().includes(searchLower);
    const answerMatch = question.answer?.toLowerCase().includes(searchLower) || false;

    return questionMatch || answerMatch;
  });

  const approvedCount = questions.filter((q) => q.status === 'approved').length;

  const answeredCount = questions.filter(
    (q) => q.answer && q.answer.trim() !== '' && q.answer !== null,
  ).length;

  // Show spinner ONLY in table area while loading questionnaire or questions
  const showTableSpinner = isLoading || isLoadingQuestions;

  // Create a placeholder questionnaire object if not loaded yet
  const displayQuestionnaire = questionnaire || {
    id: id,
    name: 'Loading...',
    filename: '',
    upload_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AppLayout>
      <TooltipProvider delayDuration={500}>
        {/* Multi-select banner - positioned absolutely at top center */}
        <MultiSelectBanner
          selectedCount={selectedQuestions.size}
          itemType='question'
          onClose={handleClearSelection}
        >
          <BannerActionButton onClick={handleBulkApprove}>Approve</BannerActionButton>
          <BannerActionButton onClick={handleBulkUnapprove}>Unapprove</BannerActionButton>
          <BannerActionButton onClick={handleBulkDelete}>Delete</BannerActionButton>
        </MultiSelectBanner>

        <div className='p-6 space-y-4'>
          <QuestionnaireDetailView
            questionnaire={displayQuestionnaire}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onBack={handleBackToList}
            onExport={handleExport}
            approvedCount={approvedCount}
            answeredCount={answeredCount}
            totalCount={questions.length}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            onGenerateAnswers={handleGenerateAnswers}
            onStopGeneration={() => stopPolling(true)}
          >
            {showTableSpinner ? (
              <LoadingSpinner />
            ) : questions.length === 0 ? (
              <div className='text-center py-8 space-y-3'>
                <HelpCircle className='w-12 h-12 text-gray-500 mx-auto' />
                <div className='text-lg font-medium text-gray-500'>No questions found</div>
                <div className='text-sm text-gray-500'>
                  Upload an Excel questionnaire to get started
                </div>
              </div>
            ) : filteredQuestions.length === 0 && searchTerm ? (
              <div className='text-center py-8 space-y-3'>
                <Search className='w-12 h-12 text-gray-500 mx-auto' />
                <div className='text-lg font-medium text-gray-500'>
                  No questions match your search
                </div>
                <div className='text-sm text-gray-500'>
                  Try adjusting your search term or clear the search to see all questions
                </div>
              </div>
            ) : (
              <QuestionsTable
                data={filteredQuestions}
                selectedRows={selectedQuestions}
                onRowSelect={toggleQuestionSelection}
                onSelectAll={(selected) => {
                  if (selected) {
                    setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)));
                  } else {
                    setSelectedQuestions(new Set());
                  }
                }}
                onEdit={startEditing}
                onApprove={(question) => toggleApproval(question.id, question.status)}
                onUnapprove={(question) => toggleApproval(question.id, question.status)}
                onGenerateAI={handleGenerateSingleAnswer}
                onRegenerateAI={handleRegenerateAnswer}
              />
            )}
          </QuestionnaireDetailView>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
