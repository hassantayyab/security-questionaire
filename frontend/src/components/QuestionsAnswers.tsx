'use client';

import AppButton from '@/components/AppButton';
import QuestionnaireDetailView from '@/components/QuestionnaireDetailView';
import QuestionnairesTable from '@/components/QuestionnairesTable';
import QuestionsTable from '@/components/QuestionsTable';
import SearchField from '@/components/SearchField';
import { ExcelUploadDialog } from '@/components/dialogs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { appConfig } from '@/config/app';
import { api, ApiError } from '@/lib/api';
import { GenerateAnswersResponse, Question, Questionnaire, UploadResponse } from '@/types';
import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface QuestionsAnswersProps {
  onCountChange?: (count: number) => void;
}

export default function QuestionsAnswers({ onCountChange }: QuestionsAnswersProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [selectedQuestionnaireRows, setSelectedQuestionnaireRows] = useState<Set<string>>(
    new Set(),
  );
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
    loadQuestionnaires();
  }, []);

  useEffect(() => {
    if (selectedQuestionnaire) {
      loadQuestions(selectedQuestionnaire.id);
    } else {
      setQuestions([]);
    }
  }, [selectedQuestionnaire]);

  // Notify parent component when questions count changes
  useEffect(() => {
    onCountChange?.(questions.length);
  }, [questions.length, onCountChange]);

  // Cleanup polling interval on unmount or questionnaire change
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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

  const loadQuestions = async (questionnaireId: string) => {
    try {
      const response = await api.getQuestions(questionnaireId);
      if (response.success) {
        const newQuestions = response.questions || [];
        setQuestions(newQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const startPolling = (questionnaireId: string, totalQuestions: number) => {
    // Stop any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Get current completed count
    const currentCompleted = questions.filter(
      (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
    ).length;

    setGenerationProgress({ total: totalQuestions, completed: currentCompleted });

    const interval = setInterval(() => {
      loadQuestions(questionnaireId);
    }, 2000); // Poll every 2 seconds for faster updates

    setPollingInterval(interval);

    // Add a timeout to prevent infinite polling (max 10 minutes)
    setTimeout(() => {
      if (pollingInterval) {
        stopPolling();
        toast.warning('Answer generation timed out. Some answers may still be processing.');
      }
    }, 10 * 60 * 1000); // 10 minutes
  };

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setGenerationProgress(null);
    setIsGenerating(false);
  }, [pollingInterval]);

  // Check for completion when questions change
  useEffect(() => {
    if (isGeneratingRef.current && questions.length > 0) {
      const questionsWithAnswers = questions.filter(
        (q: Question) => q.answer && q.answer.trim() !== '' && q.answer !== null,
      ).length;

      // Update progress - only if it's actually different
      setGenerationProgress((prev) => {
        if (prev && prev.completed !== questionsWithAnswers) {
          return { ...prev, completed: questionsWithAnswers };
        }
        return prev;
      });

      // Check if all questions have answers - if yes, stop polling
      if (questionsWithAnswers === questions.length && questionsWithAnswers > 0) {
        stopPolling();
        toast.success(`All ${questionsWithAnswers} answers have been generated!`);
      }
    }
  }, [questions, stopPolling]);

  const handleExcelUpload = async (file: File) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > appConfig.maxFileSize) {
      toast.error(`File size must be less than ${appConfig.maxFileSize / 1024 / 1024}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const response: UploadResponse = await api.uploadExcel(file);

      if (response.success) {
        toast.success(response.message);

        // Add new questionnaire
        const newQuestionnaire: Questionnaire = {
          id: response.questionnaire_id || '',
          name: response.filename,
          filename: response.filename,
          upload_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          question_count: response.questions_count || 0,
        };

        setQuestionnaires((prev) => [newQuestionnaire, ...prev]);
        setSelectedQuestionnaire(newQuestionnaire);
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Excel upload error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload Excel file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAnswers = async () => {
    if (!selectedQuestionnaire) return;

    setIsGenerating(true);
    try {
      const response: GenerateAnswersResponse = await api.generateAnswers(selectedQuestionnaire.id);

      if (response.success) {
        if (response.status === 'processing') {
          toast.success(response.message, {
            description: 'Watch the progress below as answers are generated in real-time!',
            duration: 5000,
          });

          // Start polling for real-time updates
          const totalToGenerate = response.total_questions || questions.length;
          startPolling(selectedQuestionnaire.id, totalToGenerate);
        } else {
          // Immediate completion (shouldn't happen with current backend, but good fallback)
          toast.success(`Generated answers for ${response.generated_count || 0} questions`);

          if (response.errors && response.errors.length > 0) {
            toast.warning(`${response.errors.length} questions had errors`);
          }

          // Reload questions to get the final state
          await loadQuestions(selectedQuestionnaire.id);
          setIsGenerating(false);
        }
      } else {
        toast.error('Failed to start answer generation');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Generate answers error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start answer generation. Please try again.');
      }
      setIsGenerating(false);
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

      // Update local state
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

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditingAnswer('');
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

        // Remove questionnaire from state
        setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaire.id));

        // If this was the selected questionnaire, clear selection
        if (selectedQuestionnaire?.id === questionnaire.id) {
          setSelectedQuestionnaire(null);
          setQuestions([]);
        }
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

      // Update local state
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

  const handleBulkApproval = async (status: 'approved' | 'unapproved') => {
    if (selectedQuestions.size === 0) {
      toast.error('Please select questions first');
      return;
    }

    try {
      await api.bulkApproveAnswers(Array.from(selectedQuestions), status);

      // Update local state
      setQuestions((prev) => prev.map((q) => (selectedQuestions.has(q.id) ? { ...q, status } : q)));

      setSelectedQuestions(new Set());
      toast.success(`${selectedQuestions.size} questions ${status}`);
    } catch (error) {
      console.error('Bulk approval error:', error);
      toast.error('Failed to update questions');
    }
  };

  const handleExport = async () => {
    if (!selectedQuestionnaire) return;

    try {
      const response = await api.exportAnswers(selectedQuestionnaire.id);

      if (response.success && response.approved_questions) {
        // Create downloadable file
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
        a.download = `${selectedQuestionnaire.name}_answers.csv`;
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
    setSelectedQuestionnaire(questionnaire);
  };

  const handleBackToList = () => {
    setSelectedQuestionnaire(null);
    setSearchTerm(''); // Clear search when going back
  };

  const handleGenerateSingleAnswer = async (question: Question) => {
    // Logic to generate AI answer for a single question
    toast.info('Generating AI answer for this question...');
    // TODO: Implement single question answer generation
  };

  const handleRegenerateAnswer = async (question: Question) => {
    // Logic to regenerate AI answer for a question
    toast.info('Regenerating AI answer...');
    // TODO: Implement answer regeneration
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter questions based on search term (search in both question text and answer)
  const filteredQuestions = questions.filter((question) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const questionMatch = question.question_text.toLowerCase().includes(searchLower);
    const answerMatch = question.answer?.toLowerCase().includes(searchLower) || false;

    return questionMatch || answerMatch;
  });

  const approvedCount = filteredQuestions.filter((q) => q.status === 'approved').length;
  const unapprovedCount = filteredQuestions.filter((q) => q.status === 'unapproved').length;

  return (
    <TooltipProvider delayDuration={500}>
      <div className='space-y-6'>
        {/* Conditional rendering: List View or Detail View */}
        {!selectedQuestionnaire ? (
          <>
            {/* LIST VIEW: Questionnaires Table */}
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
                <AppButton variant='primary'>
                  <Plus className='h-4 w-4 mr-2' />
                  Import questionnaire
                </AppButton>
              </ExcelUploadDialog>
            </div>

            {/* Questionnaires Table */}
            {questionnaires.length > 0 ? (
              <QuestionnairesTable
                data={questionnaires}
                selectedRows={selectedQuestionnaireRows}
                onRowSelect={handleQuestionnaireRowSelect}
                onSelectAll={handleQuestionnaireSelectAll}
                onView={handleViewQuestionnaire}
                onDelete={handleDeleteQuestionnaire}
              />
            ) : (
              <Card>
                <CardContent className='py-12'>
                  <div className='text-center space-y-3'>
                    <FileSpreadsheet className='w-12 h-12 text-gray-500 mx-auto' />
                    <div className='text-lg font-medium text-gray-500'>No questionnaires found</div>
                    <div className='text-sm text-gray-500'>
                      Upload an Excel questionnaire to get started
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* DETAIL VIEW: Questionnaire Questions */}
            <QuestionnaireDetailView
              questionnaire={selectedQuestionnaire}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onBack={handleBackToList}
              onExport={handleExport}
              approvedCount={approvedCount}
              totalCount={questions.length}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
            >
              {/* Questions Management */}
              {
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='flex items-center gap-2'>
                          <HelpCircle className='w-5 h-5' />
                          Questions & Answers
                          <Badge variant='outline'>
                            {searchTerm
                              ? `${filteredQuestions.length}/${questions.length}`
                              : `${questions.length} total`}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Review, edit, and approve AI-generated answers for your questionnaire.
                        </CardDescription>
                      </div>
                      <div className='flex items-center gap-2'>
                        {questions.length > 0 && (
                          <div className='flex items-center gap-2 text-sm'>
                            <Badge className='gap-1 bg-violet-600 text-white border-violet-600'>
                              <CheckCircle className='w-3 h-3' />
                              {approvedCount} approved
                            </Badge>
                            <Badge variant='secondary' className='gap-1'>
                              <XCircle className='w-3 h-3' />
                              {unapprovedCount} pending
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {questions.length === 0 ? (
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
                      <div className='space-y-4'>
                        {/* Action Buttons */}
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Button
                            onClick={handleGenerateAnswers}
                            disabled={isGenerating}
                            className='gap-2 bg-violet-600 text-white hover:bg-violet-600/90 focus:ring-violet-600/20'
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className='w-4 h-4' />
                                Generate AI Answers
                              </>
                            )}
                          </Button>

                          {isGenerating && (
                            <Button
                              variant='outline'
                              onClick={stopPolling}
                              className='gap-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20'
                            >
                              <X className='w-4 h-4' />
                              Stop Generation
                            </Button>
                          )}

                          {approvedCount > 0 && (
                            <Button
                              variant='outline'
                              onClick={handleExport}
                              className='gap-2 ml-auto border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20'
                            >
                              <Download className='w-4 h-4' />
                              Export Approved ({approvedCount})
                            </Button>
                          )}
                        </div>

                        {/* Questions Table */}
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              }
            </QuestionnaireDetailView>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
