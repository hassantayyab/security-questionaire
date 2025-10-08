'use client';

import { AppLayout, BannerActionButton, LoadingSpinner, MultiSelectBanner } from '@/components';
import QuestionnaireDetailView from '@/components/QuestionnaireDetailView';
import QuestionsTable from '@/components/QuestionsTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { api, ApiError } from '@/lib/api';
import { GenerateAnswersResponse, Question, Questionnaire } from '@/types';
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
  const [generatingQuestionIds, setGeneratingQuestionIds] = useState<Set<string>>(new Set());
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

  // Update generating question IDs and progress whenever questions change during generation
  useEffect(() => {
    if (isGeneratingRef.current && questions.length > 0) {
      // Remove question IDs that now have answers from the generating set
      setGeneratingQuestionIds((prev) => {
        const newSet = new Set(prev);
        questions.forEach((q) => {
          if (q.answer && q.answer.trim() !== '' && q.answer !== null) {
            newSet.delete(q.id);
          }
        });
        return newSet;
      });

      // Update generation progress
      const answeredCount = questions.filter(
        (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
      ).length;

      setGenerationProgress({
        total: questions.length,
        completed: answeredCount,
      });
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
          // Load questions immediately after setting questionnaire
          await loadQuestions(found.id);
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

  const startPolling = (questionnaireId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(() => {
      loadQuestions(questionnaireId);
    }, 3000); // Poll every 3 seconds for faster updates

    setPollingInterval(interval);

    setTimeout(() => {
      if (pollingInterval) {
        stopPolling();
        toast.warning('Answer generation timed out. Some answers may still be processing.');
      }
    }, 10 * 60 * 1000);
  };

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsGenerating(false);
    setGeneratingQuestionIds(new Set());
    // Keep generationProgress to show final state
  }, [pollingInterval]);

  // Check if generation is complete during polling
  useEffect(() => {
    if (isGeneratingRef.current && questions.length > 0) {
      const questionsWithAnswers = questions.filter(
        (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
      ).length;

      // Check if all questions have been answered
      if (questionsWithAnswers === questions.length && questionsWithAnswers > 0) {
        stopPolling();
        toast.success(`All ${questionsWithAnswers} answers have been generated!`);
      }
    }
  }, [questions, stopPolling]);

  const handleGenerateAnswers = async () => {
    if (!questionnaire) return;

    // Identify questions that need answers generated
    const questionsToGenerate = questions.filter(
      (q: Question) => !q.answer || q.answer.trim() === '' || q.answer === null,
    );

    // Mark these questions as generating
    setGeneratingQuestionIds(new Set(questionsToGenerate.map((q) => q.id)));
    setIsGenerating(true);

    // Initialize generation progress
    const initialCompleted = questions.filter(
      (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
    ).length;

    setGenerationProgress({
      total: questions.length,
      completed: initialCompleted,
    });

    try {
      const response: GenerateAnswersResponse = await api.generateAnswers(questionnaire.id);

      if (response.success) {
        if (response.status === 'processing') {
          toast.success(response.message, {
            description: 'Answers are being generated with AI!',
            duration: 5000,
          });

          // Start polling for real-time updates
          startPolling(questionnaire.id);
        } else {
          toast.success(`Generated answers for ${response.generated_count || 0} questions`);

          if (response.errors && response.errors.length > 0) {
            toast.warning(`${response.errors.length} questions had errors`);
          }

          await loadQuestions(questionnaire.id);
          setIsGenerating(false);
          setGeneratingQuestionIds(new Set());
        }
      } else {
        toast.error('Failed to start answer generation');
        setIsGenerating(false);
        setGeneratingQuestionIds(new Set());
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
      setGeneratingQuestionIds(new Set());
      setGenerationProgress(null);
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingAnswer(question.answer || '');
  };

  const saveAnswer = async (questionId: string) => {
    try {
      await api.updateAnswer(questionId, editingAnswer, 'unapproved', 'user');
      toast.success('Answer updated');

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answer: editingAnswer,
                status: 'unapproved' as const,
                answer_source: 'user' as const,
              }
            : q,
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

    // Filter questions that have answers (regardless of approval status)
    const questionsWithAnswers = questions.filter(
      (q) => q.answer && q.answer.trim() !== '' && q.answer !== null,
    );

    if (questionsWithAnswers.length === 0) {
      toast.error('No answers found to export');
      return;
    }

    try {
      // Create CSV content from local questions data
      const csvContent = [
        ['Question', 'Answer', 'Status'],
        ...questionsWithAnswers.map((q) => [
          q.question_text,
          q.answer || '',
          q.status || 'unapproved',
        ]),
      ]
        .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${questionnaire.name}_answers.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${questionsWithAnswers.length} answered question${
          questionsWithAnswers.length !== 1 ? 's' : ''
        }`,
      );
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
    try {
      // Mark this question as generating (don't update generationProgress for single questions)
      setGeneratingQuestionIds((prev) => new Set(prev).add(question.id));

      toast.info('Generating AI answer for this question...', {
        description: 'This may take a few seconds',
      });

      const response = await api.generateSingleAnswer(question.id);

      if (response.success) {
        toast.success('Answer generated successfully!');

        // Update the question in the list with the new answer
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? {
                  ...q,
                  answer: response.answer,
                  status: 'unapproved' as const,
                  answer_source: 'ai' as const,
                }
              : q,
          ),
        );
      } else {
        toast.error('Failed to generate answer');
      }
    } catch (error) {
      console.error('Generate single answer error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to generate answer. Please try again.');
      }
    } finally {
      // Remove from generating set
      setGeneratingQuestionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  const handleRegenerateAnswer = async (question: Question) => {
    try {
      // Mark this question as generating (don't update generationProgress for single questions)
      setGeneratingQuestionIds((prev) => new Set(prev).add(question.id));

      toast.info('Regenerating AI answer...', {
        description: 'This may take a few seconds',
      });

      const response = await api.generateSingleAnswer(question.id);

      if (response.success) {
        toast.success('Answer regenerated successfully!');

        // Update the question in the list with the new answer
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? {
                  ...q,
                  answer: response.answer,
                  status: 'unapproved' as const,
                  answer_source: 'ai' as const,
                }
              : q,
          ),
        );
      } else {
        toast.error('Failed to regenerate answer');
      }
    } catch (error) {
      console.error('Regenerate answer error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to regenerate answer. Please try again.');
      }
    } finally {
      // Remove from generating set
      setGeneratingQuestionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditingAnswer('');
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
    const selectedQuestionsList = questions.filter((q) => selectedQuestions.has(q.id));

    if (selectedQuestionsList.length === 0) {
      toast.info('No questions selected to delete');
      return;
    }

    try {
      const questionIds = Array.from(selectedQuestions);
      const response = await api.bulkDeleteQuestions(questionIds);

      if (response.success) {
        // Remove deleted questions from state
        setQuestions((prev) => prev.filter((q) => !selectedQuestions.has(q.id)));

        toast.success(
          `Deleted ${response.deleted_count} question${response.deleted_count !== 1 ? 's' : ''}`,
        );

        if (response.errors && response.errors.length > 0) {
          toast.warning(
            `${response.errors.length} question${
              response.errors.length !== 1 ? 's' : ''
            } had errors`,
          );
        }

        setSelectedQuestions(new Set());
      } else {
        toast.error('Failed to delete questions');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete questions');
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const handleStatusChange = async (status: 'in_progress' | 'approved' | 'complete') => {
    if (!questionnaire) return;

    try {
      const response = await api.updateQuestionnaireStatus(questionnaire.id, status);

      if (response.success) {
        toast.success(`Questionnaire status updated to ${status.replace('_', ' ')}`);

        // Update local state
        setQuestionnaire((prev) => (prev ? { ...prev, status } : null));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update status. Please try again.');
      }
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    try {
      const response = await api.deleteQuestion(question.id);

      if (response.success) {
        toast.success('Question deleted successfully');

        // Remove question from state
        setQuestions((prev) => prev.filter((q) => q.id !== question.id));
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete question. Please try again.');
      }
    }
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
  // BUT not during polling/generation to avoid UI flickering
  const showTableSpinner = (isLoading || isLoadingQuestions) && !isGenerating;

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
            onStatusChange={handleStatusChange}
            approvedCount={approvedCount}
            answeredCount={answeredCount}
            totalCount={questions.length}
            isGenerating={isGenerating}
            isLoading={isLoading}
            generationProgress={generationProgress}
            onGenerateAnswers={handleGenerateAnswers}
          >
            {showTableSpinner ? (
              <LoadingSpinner />
            ) : questions.length === 0 ? (
              <div className='text-center py-12 space-y-3'>
                <div className='text-lg font-medium text-gray-500'>No questions found</div>
                <div className='text-sm text-gray-500'>
                  Upload an Excel questionnaire to get started
                </div>
              </div>
            ) : filteredQuestions.length === 0 && searchTerm ? (
              <div className='text-center py-12 space-y-3'>
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
                onDelete={handleDeleteQuestion}
                onGenerateAI={handleGenerateSingleAnswer}
                onRegenerateAI={handleRegenerateAnswer}
                editingQuestionId={editingQuestionId}
                editingAnswer={editingAnswer}
                onEditAnswerChange={setEditingAnswer}
                onSaveAnswer={saveAnswer}
                onCancelEdit={cancelEditing}
                generatingQuestionIds={generatingQuestionIds}
              />
            )}
          </QuestionnaireDetailView>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
