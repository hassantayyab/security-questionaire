export interface Policy {
  id: string;
  name: string;
  filename: string;
  file_size: number;
  extracted_text?: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
  owner?: {
    name: string;
    avatar?: string;
  };
  use_in_questionnaire?: boolean;
}

export interface Questionnaire {
  id: string;
  name: string;
  filename: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
  question_count?: number;
}

export interface Question {
  id: string;
  question_text: string;
  answer?: string;
  status: 'unapproved' | 'approved';
  questionnaire_id: string;
  created_at: string;
  updated_at: string;
  row_number?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  file_size: number;
  text_length?: number;
  text_preview?: string;
  policy_id?: string;
  questionnaire_id?: string;
  questions_count?: number;
  questions_preview?: Partial<Question>[];
}

export interface GenerateAnswersResponse {
  success: boolean;
  message: string;
  questionnaire_id: string;
  generated_count?: number;
  total_questions: number;
  errors?: string[];
  status?: string;
  note?: string;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  questionnaire_id: string;
  approved_questions: Question[];
  export_data: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface FileUploadProps {
  accept: string;
  maxSize: number;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  allowedTypes: string[];
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface BulkOperationRequest {
  question_ids: string[];
  status: 'approved' | 'unapproved';
}

export interface Answer {
  id: string;
  question: string;
  answer: string;
  source_type: 'user' | 'questionnaire';
  source_name: string;
  created_at: string;
  updated_at: string;
}

export interface AnswerLibraryResponse {
  success: boolean;
  answers: Answer[];
  count: number;
}

export interface AnswerCreateResponse {
  success: boolean;
  message: string;
  answer: Answer;
}

export interface AnswerDeleteResponse {
  success: boolean;
  message: string;
  answer_id: string;
}

export type { NavigationItem, NavigationSection } from './navigation';
