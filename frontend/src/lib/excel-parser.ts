import type {
  ColumnMapping,
  ExcelRow,
  ImportValidationResult,
  MappedAnswer,
  ParsedExcelData,
} from '@/types/excel';
import * as XLSX from 'xlsx';

/**
 * Parse an Excel file and extract headers and rows
 */
export const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file');
        }

        // Read the workbook
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('Excel file is empty');
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('Failed to read worksheet');
        }

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false, // Convert to strings
        }) as ExcelRow[];

        if (jsonData.length === 0) {
          throw new Error('Excel file has no data rows');
        }

        // Extract headers from the first row
        const headers = Object.keys(jsonData[0] || {});

        if (headers.length === 0) {
          throw new Error('Excel file has no columns');
        }

        resolve({
          headers,
          rows: jsonData,
          rowCount: jsonData.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Map Excel rows to question-answer pairs based on column selection
 */
export const mapRowsToAnswers = (rows: ExcelRow[], mapping: ColumnMapping): MappedAnswer[] => {
  const { questionColumn, answerColumn } = mapping;

  return rows
    .map((row, index) => {
      const question = String(row[questionColumn] || '').trim();
      const answer = String(row[answerColumn] || '').trim();

      return {
        question,
        answer,
        rowIndex: index + 2, // +2 because Excel rows are 1-indexed and first row is header
      };
    })
    .filter((item) => item.question && item.answer); // Filter out empty rows
};

/**
 * Validate mapped answers before import
 */
export const validateAnswers = (mappedAnswers: MappedAnswer[]): ImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validAnswers: MappedAnswer[] = [];
  let invalidCount = 0;

  if (mappedAnswers.length === 0) {
    errors.push('No valid question-answer pairs found');
    return {
      valid: false,
      errors,
      warnings,
      validAnswers: [],
      invalidCount: 0,
    };
  }

  mappedAnswers.forEach((item) => {
    const questionLength = item.question.length;
    const answerLength = item.answer.length;

    // Validate question length
    if (questionLength < 1 || questionLength > 500) {
      errors.push(
        `Row ${item.rowIndex}: Question must be between 1 and 500 characters (current: ${questionLength})`,
      );
      invalidCount++;
      return;
    }

    // Validate answer length
    if (answerLength < 1 || answerLength > 5000) {
      errors.push(
        `Row ${item.rowIndex}: Answer must be between 1 and 5000 characters (current: ${answerLength})`,
      );
      invalidCount++;
      return;
    }

    // Check for very short answers (warning only)
    if (answerLength < 10) {
      warnings.push(`Row ${item.rowIndex}: Answer is very short (${answerLength} characters)`);
    }

    validAnswers.push(item);
  });

  return {
    valid: validAnswers.length > 0 && errors.length === 0,
    errors,
    warnings,
    validAnswers,
    invalidCount,
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};

/**
 * Validate Excel file before parsing
 */
export const validateExcelFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  const validExtensions = ['.xlsx', '.xls'];

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 5MB (current: ${formatFileSize(file.size)})`,
    };
  }

  // Check file type
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!hasValidType && !hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
    };
  }

  return { valid: true };
};
