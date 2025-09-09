'use client';

import FileUpload from '@/components/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
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
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  useEffect(() => {
    if (selectedQuestionnaire) {
      loadQuestions(selectedQuestionnaire.id);
    }
  }, [selectedQuestionnaire]);

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
        setQuestions(response.questions || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    }
  };

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
        toast.success(`Generated answers for ${response.generated_count} questions`);

        if (response.errors.length > 0) {
          toast.warning(`${response.errors.length} questions had errors`);
        }

        // Reload questions to get the generated answers
        await loadQuestions(selectedQuestionnaire.id);
      } else {
        toast.error('Failed to generate answers');
      }
    } catch (error) {
      console.error('Generate answers error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to generate answers. Please try again.');
      }
    } finally {
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
        `Are you sure you want to delete "${questionnaire.name}" and all its questions? This action cannot be undone.`,
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
          .map((row) => row.map((cell: any) => `"${cell.replace(/"/g, '""')}"`).join(','))
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

  return (
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
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
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
                  className={`transition-colors ${
                    selectedQuestionnaire?.id === questionnaire.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div
                          className='flex-1 cursor-pointer'
                          onClick={() => setSelectedQuestionnaire(questionnaire)}
                        >
                          <div className='font-medium'>{questionnaire.name}</div>
                          <div className='text-sm text-muted-foreground'>
                            {formatDate(questionnaire.upload_date)}
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestionnaire(questionnaire);
                          }}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                      {questionnaire.question_count && (
                        <Badge variant='secondary'>{questionnaire.question_count} questions</Badge>
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
                    <Badge variant='default' className='gap-1'>
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
                <HelpCircle className='w-12 h-12 text-muted-foreground mx-auto' />
                <div className='text-lg font-medium text-muted-foreground'>No questions found</div>
                <div className='text-sm text-muted-foreground'>
                  Upload an Excel questionnaire to get started
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Action Buttons */}
                <div className='flex items-center gap-2 flex-wrap'>
                  <Button onClick={handleGenerateAnswers} disabled={isGenerating} className='gap-2'>
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

                  {selectedQuestions.size > 0 && (
                    <>
                      <Button
                        variant='outline'
                        onClick={() => handleBulkApproval('approved')}
                        className='gap-2'
                      >
                        <CheckCircle className='w-4 h-4' />
                        Approve Selected ({selectedQuestions.size})
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => handleBulkApproval('unapproved')}
                        className='gap-2'
                      >
                        <XCircle className='w-4 h-4' />
                        Unapprove Selected ({selectedQuestions.size})
                      </Button>
                    </>
                  )}

                  {approvedCount > 0 && (
                    <Button variant='outline' onClick={handleExport} className='gap-2 ml-auto'>
                      <Download className='w-4 h-4' />
                      Export Approved ({approvedCount})
                    </Button>
                  )}
                </div>

                {/* Questions Table */}
                <div className='overflow-x-auto border rounded-lg'>
                  <Table className='min-w-full'>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12 min-w-12'>
                          <input
                            type='checkbox'
                            className='rounded'
                            checked={
                              selectedQuestions.size === questions.length && questions.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuestions(new Set(questions.map((q) => q.id)));
                              } else {
                                setSelectedQuestions(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className='w-1/3 min-w-[250px]'>Question</TableHead>
                        <TableHead className='w-2/5 min-w-[300px]'>Answer</TableHead>
                        <TableHead className='w-20 min-w-[100px]'>Status</TableHead>
                        <TableHead className='w-24 min-w-[120px] text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className='w-12 min-w-12'>
                            <input
                              type='checkbox'
                              className='rounded'
                              checked={selectedQuestions.has(question.id)}
                              onChange={() => toggleQuestionSelection(question.id)}
                            />
                          </TableCell>
                          <TableCell className='w-1/3 min-w-[250px]'>
                            <div className='text-sm leading-relaxed break-words pr-4'>
                              {question.question_text}
                            </div>
                          </TableCell>
                          <TableCell className='w-2/5 min-w-[300px]'>
                            {editingQuestionId === question.id ? (
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
                                    className='gap-1'
                                  >
                                    <Save className='w-3 h-3' />
                                    Save
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={cancelEditing}
                                    className='gap-1'
                                  >
                                    <X className='w-3 h-3' />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className='text-sm leading-relaxed break-words pr-4 py-2'>
                                {question.answer ? (
                                  <div className='whitespace-pre-wrap'>{question.answer}</div>
                                ) : (
                                  <span className='text-muted-foreground italic'>
                                    No answer generated yet
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className='w-20 min-w-[100px]'>
                            <Badge
                              variant={question.status === 'approved' ? 'default' : 'secondary'}
                              className='gap-1'
                            >
                              {question.status === 'approved' ? (
                                <CheckCircle className='w-3 h-3' />
                              ) : (
                                <XCircle className='w-3 h-3' />
                              )}
                              <span className='hidden lg:inline'>{question.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className='w-24 min-w-[120px] text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => startEditing(question)}
                                disabled={editingQuestionId === question.id}
                                title='Edit answer'
                              >
                                <Edit className='w-4 h-4' />
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => toggleApproval(question.id, question.status)}
                                title={question.status === 'approved' ? 'Unapprove' : 'Approve'}
                              >
                                {question.status === 'approved' ? (
                                  <XCircle className='w-4 h-4' />
                                ) : (
                                  <CheckCircle className='w-4 h-4' />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
