/**
 * Excel Import Types
 */

export interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

export interface ParsedExcelData {
  headers: string[];
  rows: ExcelRow[];
  rowCount: number;
}

export interface ColumnMapping {
  questionColumn: string;
  answerColumn: string;
}

export interface MappedAnswer {
  question: string;
  answer: string;
  rowIndex: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validAnswers: MappedAnswer[];
  invalidCount: number;
}
