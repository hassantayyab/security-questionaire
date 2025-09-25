'use client';

import DataTable, {
  createBadgeCell,
  createTextCell,
  DataTableAction,
  DataTableColumn,
} from '@/components/DataTable';
import FileUpload from '@/components/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { appConfig } from '@/config/app';
import { api, ApiError } from '@/lib/api';
import { GenerateAnswersResponse, Question, Questionnaire, UploadResponse } from '@/types';
import {
  CheckCircle,
  Download,
  Edit,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

export default function QuestionsAnswers() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    total: number;
    completed: number;
  } | null>(null);
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
    }
  }, [selectedQuestionnaire]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const approvedCount = questions.filter((q) => q.status === 'approved').length;
  const unapprovedCount = questions.filter((q) => q.status === 'unapproved').length;

  // DataTable column configurations
  const columns: DataTableColumn<Question>[] = [
    {
      key: 'question_text',
      header: 'Question',
      width: '35%',
      maxWidth: '250px',
      className: 'w-[35%]',
      render: createTextCell(2, true),
    },
    {
      key: 'answer',
      header: 'Answer',
      width: '35%',
      maxWidth: '250px',
      className: 'w-[35%]',
      render: (question: Question) => {
        if (editingQuestionId === question.id) {
          return (
            <div className='space-y-3 py-2'>
              <Textarea
                value={editingAnswer}
                onChange={(e) => setEditingAnswer(e.target.value)}
                placeholder='Enter answer...'
                className='text-sm resize-none min-h-[80px] w-full'
                rows={3}
              />
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={() => saveAnswer(question.id)}
                  className='gap-1 bg-violet-600 text-white hover:bg-violet-600/90 focus:ring-violet-600/20'
                >
                  <Save className='w-3 h-3' />
                  Save
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={cancelEditing}
                  className='gap-1 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20'
                >
                  <X className='w-3 h-3' />
                  Cancel
                </Button>
              </div>
            </div>
          );
        }

        if (question.answer) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='line-clamp-2 leading-relaxed whitespace-normal break-words markdown-content cursor-help text-sm pr-4 py-2'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <span className='inline'>{children}</span>,
                      strong: ({ children }) => (
                        <strong className='font-semibold'>{children}</strong>
                      ),
                      em: ({ children }) => <em className='italic'>{children}</em>,
                      code: ({ children }) => (
                        <code className='bg-gray-100 px-1 py-0.5 rounded-md text-xs font-mono'>
                          {children}
                        </code>
                      ),
                      ul: ({ children }) => <span className='inline'>{children}</span>,
                      ol: ({ children }) => <span className='inline'>{children}</span>,
                      li: ({ children }) => <span className='inline'>{children} </span>,
                      h1: ({ children }) => <span className='font-semibold'>{children}</span>,
                      h2: ({ children }) => <span className='font-semibold'>{children}</span>,
                      h3: ({ children }) => <span className='font-semibold'>{children}</span>,
                      h4: ({ children }) => <span className='font-semibold'>{children}</span>,
                      h5: ({ children }) => <span className='font-semibold'>{children}</span>,
                      h6: ({ children }) => <span className='font-semibold'>{children}</span>,
                      br: () => <span> </span>,
                    }}
                  >
                    {question.answer}
                  </ReactMarkdown>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className='max-w-md p-3 text-sm whitespace-normal break-words'
                side='top'
              >
                <div className='max-h-40 overflow-y-auto prose prose-sm dark:prose-invert'>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.answer}</ReactMarkdown>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <div className='text-sm pr-4 py-2'>
            <span className='text-gray-500 italic'>No answer generated yet</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '20',
      className: 'w-20',
      render: createBadgeCell((question: Question) => ({
        className: `gap-1 ${
          question.status === 'approved'
            ? 'bg-violet-600 text-white border-violet-600'
            : 'bg-secondary text-secondary-foreground border-secondary'
        }`,
        children: (
          <>
            {question.status === 'approved' ? (
              <CheckCircle className='w-3 h-3' />
            ) : (
              <XCircle className='w-3 h-3' />
            )}
            <span className='hidden lg:inline'>{question.status}</span>
          </>
        ),
      })),
    },
  ];

  // DataTable action configurations - we need to create different actions based on question status
  const getActionsForQuestion = (question: Question): DataTableAction<Question>[] => [
    {
      label: 'Edit answer',
      icon: Edit,
      onClick: startEditing,
      disabled: () => editingQuestionId === question.id,
      variant: 'outline',
      className:
        'border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20',
    },
    {
      label: question.status === 'approved' ? 'Unapprove' : 'Approve',
      icon: question.status === 'approved' ? XCircle : CheckCircle,
      onClick: () => toggleApproval(question.id, question.status),
      title: () => (question.status === 'approved' ? 'Unapprove' : 'Approve'),
      variant: 'outline',
      className:
        'border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20',
    },
  ];

  return (
    <TooltipProvider delayDuration={500}>
      <div className='space-y-6'>
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5' />
              Upload Questionnaire
            </CardTitle>
            <CardDescription>
              Upload Excel files containing your security questionnaires. Questions will be parsed
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept='.xlsx,.xls'
              maxSize={appConfig.maxFileSize}
              onUpload={handleExcelUpload}
              isUploading={isUploading}
              allowedTypes={appConfig.allowedFileTypes.excel}
            />
            {isUploading && (
              <div className='mt-4 space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Processing Excel file with openpyxl...
                </div>
                <Progress value={undefined} className='w-full' />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questionnaire Selection */}
        {questionnaires.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileSpreadsheet className='w-5 h-5' />
                Select Questionnaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                {questionnaires.map((questionnaire) => (
                  <Card
                    key={questionnaire.id}
                    className={`transition-colors cursor-pointer ${
                      selectedQuestionnaire?.id === questionnaire.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedQuestionnaire(questionnaire)}
                  >
                    <CardContent className='p-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex-1 cursor-pointer'>
                            <div className='font-medium'>{questionnaire.name}</div>
                            <div className='text-sm text-gray-500'>
                              {formatDate(questionnaire.upload_date)}
                            </div>
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-red-500 hover:text-red-500'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestionnaire(questionnaire);
                            }}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                        {questionnaire.question_count && (
                          <Badge variant='secondary'>
                            {questionnaire.question_count} questions
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Management */}
        {selectedQuestionnaire && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <HelpCircle className='w-5 h-5' />
                    Questions & Answers
                    <Badge variant='outline'>{questions.length} total</Badge>
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
                          <Zap className='w-4 h-4' />
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

                  {/* Generation Progress */}
                  {isGenerating && generationProgress && (
                    <Card className='border-dashed bg-gray-100/30'>
                      <CardContent className='py-4'>
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                              <Loader2 className='w-4 h-4 animate-spin' />
                              <span className='font-medium'>Generating Answers</span>
                            </div>
                            <div className='text-gray-500'>
                              {generationProgress.completed} of {generationProgress.total} completed
                              {generationProgress.completed >= generationProgress.total && (
                                <span className='text-violet-600 ml-2'>✓ Complete</span>
                              )}
                            </div>
                          </div>
                          <Progress
                            value={(generationProgress.completed / generationProgress.total) * 100}
                            className='w-full h-2'
                          />
                          <div className='text-xs text-gray-500'>
                            Answers appear automatically below as they are generated by AI
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Questions Table */}
                  <DataTable
                    data={questions}
                    columns={columns}
                    actions={getActionsForQuestion}
                    showCheckboxes={true}
                    selectedRows={selectedQuestions}
                    onRowSelect={toggleQuestionSelection}
                    onSelectAll={(selected) => {
                      if (selected) {
                        setSelectedQuestions(new Set(questions.map((q) => q.id)));
                      } else {
                        setSelectedQuestions(new Set());
                      }
                    }}
                    getRowId={(question) => question.id}
                    getRowClassName={(question) => {
                      const hasAnswer = question.answer && question.answer.trim();
                      return `transition-all duration-300 ${
                        hasAnswer && isGenerating ? 'answer-glow' : ''
                      }`;
                    }}
                    emptyState={
                      <div className='text-center py-8 space-y-3'>
                        <HelpCircle className='w-12 h-12 text-gray-500 mx-auto' />
                        <div className='text-lg font-medium text-gray-500'>No questions found</div>
                        <div className='text-sm text-gray-500'>
                          Upload an Excel questionnaire to get started
                        </div>
                      </div>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
