'use client';

import { Button } from '@/components/ui/button';
import {
  formatFileSize,
  mapRowsToAnswers,
  parseExcelFile,
  validateAnswers,
  validateExcelFile,
} from '@/lib/excel-parser';
import { cn } from '@/lib/utils';
import type { ColumnMapping, MappedAnswer, ParsedExcelData } from '@/types/excel';
import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { StandardDialog } from './standard-dialog';

type ImportQuestionnaireDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onImport?: (answers: Array<{ question: string; answer: string }>) => Promise<void>;
};

type Step = 'upload' | 'mapping' | 'preview' | 'importing';

export const ImportQuestionnaireDialog = ({
  open,
  onOpenChange,
  onImport,
}: ImportQuestionnaireDialogProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    questionColumn: '',
    answerColumn: '',
  });
  const [mappedAnswers, setMappedAnswers] = useState<MappedAnswer[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropzoneId = useId();

  // Reset all state when dialog closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset state when closing
        setCurrentStep('upload');
        setSelectedFile(null);
        setParsedData(null);
        setColumnMapping({ questionColumn: '', answerColumn: '' });
        setMappedAnswers([]);
        setErrorMessage(null);
        setIsProcessing(false);
      }
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const handleFileSelection = useCallback(async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setErrorMessage(null);
      return;
    }

    // Validate file
    const validation = validateExcelFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Parse Excel file
      const data = await parseExcelFile(file);
      setParsedData(data);

      // Auto-select first two columns if available
      if (data.headers.length >= 2) {
        setColumnMapping({
          questionColumn: data.headers[0],
          answerColumn: data.headers[1],
        });
      } else if (data.headers.length === 1) {
        setColumnMapping({
          questionColumn: data.headers[0],
          answerColumn: '',
        });
      }

      // Move to mapping step
      setCurrentStep('mapping');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse Excel file');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      await handleFileSelection(file);
    },
    [handleFileSelection],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files.length === 0) {
        return;
      }

      const file = event.dataTransfer.files[0];
      await handleFileSelection(file);
    },
    [handleFileSelection],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setColumnMapping({ questionColumn: '', answerColumn: '' });
    setMappedAnswers([]);
    setErrorMessage(null);
    setCurrentStep('upload');
  }, []);

  const handleColumnMappingChange = useCallback(
    (field: 'questionColumn' | 'answerColumn', value: string) => {
      setColumnMapping((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handlePreview = useCallback(() => {
    if (!parsedData || !columnMapping.questionColumn || !columnMapping.answerColumn) {
      return;
    }

    // Map rows to answers
    const answers = mapRowsToAnswers(parsedData.rows, columnMapping);
    setMappedAnswers(answers);
    setCurrentStep('preview');
  }, [parsedData, columnMapping]);

  const handleImport = useCallback(async () => {
    if (!onImport || mappedAnswers.length === 0) {
      return;
    }

    // Validate before import
    const validation = validateAnswers(mappedAnswers);

    if (!validation.valid) {
      setErrorMessage(validation.errors[0] || 'Validation failed');
      return;
    }

    setCurrentStep('importing');
    setIsProcessing(true);

    try {
      // Convert to format expected by API
      const answersToImport = validation.validAnswers.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));

      await onImport(answersToImport);

      // Success - close dialog
      handleOpenChange(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import answers');
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  }, [mappedAnswers, onImport, handleOpenChange]);

  const canProceedToPreview =
    columnMapping.questionColumn &&
    columnMapping.answerColumn &&
    columnMapping.questionColumn !== columnMapping.answerColumn;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-wide text-gray-700'>
                Excel File
              </p>
              <div
                role='button'
                tabIndex={0}
                id={dropzoneId}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById(`${dropzoneId}-input`)?.click()}
                className={cn(
                  'flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 px-6 py-8 transition-colors cursor-pointer',
                  'bg-white text-center shadow-none outline-none focus-visible:border-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:ring-offset-2',
                  isDragging && 'border-violet-500 bg-violet-50',
                  errorMessage && 'border-red-300 bg-red-50/40',
                  selectedFile && 'items-start gap-4 text-left',
                )}
              >
                <input
                  id={`${dropzoneId}-input`}
                  type='file'
                  accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                  className='hidden'
                  onChange={handleFileInputChange}
                />

                {isProcessing ? (
                  <div className='flex items-center gap-3 text-violet-600'>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent' />
                    <span className='text-sm font-medium'>Processing file...</span>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <div className='flex justify-center'>
                      <Upload className='h-10 w-10 text-gray-400' />
                    </div>
                    <p className='text-sm'>
                      <button
                        type='button'
                        className='font-medium text-violet-600 underline-offset-4 transition-colors hover:text-violet-500 cursor-pointer'
                        onClick={(event) => {
                          event.stopPropagation();
                          document.getElementById(`${dropzoneId}-input`)?.click();
                        }}
                      >
                        Upload Excel file
                      </button>{' '}
                      <span className='text-gray-600'>or drag and drop</span>
                    </p>
                    <p className='text-xs text-gray-500'>.xlsx or .xls up to 5MB</p>
                  </div>
                )}
              </div>
              {errorMessage && (
                <div className='flex items-start gap-2 text-xs text-red-600'>
                  <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'mapping':
        return (
          <div className='space-y-6'>
            {/* File Info */}
            <div className='flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3'>
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-md bg-violet-600/10'>
                  <FileText className='h-5 w-5 text-violet-600' />
                </span>
                <div>
                  <p className='text-sm font-medium text-gray-900'>{selectedFile?.name}</p>
                  <p className='text-xs text-gray-500'>
                    {parsedData?.rowCount} rows • {formatFileSize(selectedFile?.size || 0)}
                  </p>
                </div>
              </div>
              <Button
                size='sm'
                variant='ghost'
                className='h-8 w-8 p-0 text-gray-500 hover:text-red-500 cursor-pointer'
                onClick={handleRemoveFile}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* Column Selection */}
            <div className='space-y-4'>
              <div>
                <p className='text-xs font-medium uppercase tracking-wide text-gray-700 mb-3'>
                  Select Columns
                </p>
                <p className='text-sm text-gray-600 mb-4'>
                  Choose which columns contain questions and answers
                </p>
              </div>

              {/* Question Column */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Question Column</label>
                <select
                  value={columnMapping.questionColumn}
                  onChange={(e) => handleColumnMappingChange('questionColumn', e.target.value)}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20 cursor-pointer'
                >
                  <option value=''>Select a column...</option>
                  {parsedData?.headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {/* Answer Column */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Answer Column</label>
                <select
                  value={columnMapping.answerColumn}
                  onChange={(e) => handleColumnMappingChange('answerColumn', e.target.value)}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20 cursor-pointer'
                >
                  <option value=''>Select a column...</option>
                  {parsedData?.headers.map((header) => (
                    <option
                      key={header}
                      value={header}
                      disabled={header === columnMapping.questionColumn}
                    >
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {columnMapping.questionColumn === columnMapping.answerColumn &&
                columnMapping.questionColumn && (
                  <div className='flex items-start gap-2 text-xs text-amber-600'>
                    <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                    <span>Question and answer columns must be different</span>
                  </div>
                )}
            </div>
          </div>
        );

      case 'preview':
        const validation = validateAnswers(mappedAnswers);
        const previewItems = mappedAnswers.slice(0, 5);

        return (
          <div className='space-y-6'>
            {/* Summary */}
            <div className='rounded-md border border-gray-200 bg-gray-50 p-4'>
              <div className='flex items-start gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-600 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    Ready to import {validation.validAnswers.length} question
                    {validation.validAnswers.length === 1 ? '' : 's'}
                  </p>
                  <p className='text-xs text-gray-600 mt-1'>
                    {validation.invalidCount > 0 &&
                      `${validation.invalidCount} row${
                        validation.invalidCount === 1 ? '' : 's'
                      } will be skipped due to validation errors. `}
                    Empty rows will be automatically skipped.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div className='rounded-md border border-red-200 bg-red-50 p-4'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium text-red-900'>Validation Errors</p>
                    {validation.errors.slice(0, 3).map((error, index) => (
                      <p key={index} className='text-xs text-red-700'>
                        • {error}
                      </p>
                    ))}
                    {validation.errors.length > 3 && (
                      <p className='text-xs text-red-700'>
                        ... and {validation.errors.length - 3} more error(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {previewItems.length > 0 && (
              <div className='space-y-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-gray-700'>
                  Preview (First {previewItems.length} rows)
                </p>
                <div className='space-y-3 max-h-[300px] overflow-y-auto'>
                  {previewItems.map((item, index) => (
                    <div key={index} className='rounded-md border border-gray-200 bg-white p-3'>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-xs font-medium text-gray-500 mb-1'>Question:</p>
                          <p className='text-sm text-gray-900 line-clamp-2'>{item.question}</p>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-500 mb-1'>Answer:</p>
                          <p className='text-sm text-gray-700 line-clamp-3'>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'importing':
        return (
          <div className='flex flex-col items-center justify-center py-12'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mb-4' />
            <p className='text-sm font-medium text-gray-900'>Importing answers...</p>
            <p className='text-xs text-gray-500 mt-1'>Please wait</p>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionLabel = () => {
    switch (currentStep) {
      case 'mapping':
        return 'Preview';
      case 'preview':
        return `Import ${mappedAnswers.length} Answer${mappedAnswers.length === 1 ? '' : 's'}`;
      default:
        return 'Next';
    }
  };

  const handleAction = () => {
    switch (currentStep) {
      case 'mapping':
        handlePreview();
        break;
      case 'preview':
        handleImport();
        break;
      default:
        break;
    }
  };

  const isActionDisabled = () => {
    switch (currentStep) {
      case 'upload':
        return true;
      case 'mapping':
        return !canProceedToPreview;
      case 'preview':
        return mappedAnswers.length === 0 || isProcessing;
      case 'importing':
        return true;
      default:
        return false;
    }
  };

  const canGoBack = currentStep === 'mapping' || currentStep === 'preview';

  return (
    <StandardDialog
      open={open}
      onOpenChange={handleOpenChange}
      title='Import Questionnaire'
      maxWidth='sm:max-w-2xl'
      onCancel={
        canGoBack
          ? () => setCurrentStep(currentStep === 'preview' ? 'mapping' : 'upload')
          : undefined
      }
      onAction={handleAction}
      actionDisabled={isActionDisabled()}
      actionLabel={getActionLabel()}
      cancelLabel={canGoBack ? 'Back' : 'Cancel'}
    >
      {renderStepContent()}
    </StandardDialog>
  );
};
