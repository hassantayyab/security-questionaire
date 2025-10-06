import { appConfig } from '@/config/app';

export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.apiBaseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP error! status: ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Network error: ${error}`, 0);
    }
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();

    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP error! status: ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Upload error: ${error}`, 0);
    }
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }

  // PDF Upload
  async uploadPdf(file: File) {
    return this.uploadFile<any>('/upload/pdf', file);
  }

  // Excel Upload
  async uploadExcel(file: File) {
    return this.uploadFile<any>('/upload/excel', file);
  }

  // Policies
  async getPolicies() {
    return this.request<any>('/questionnaires/policies');
  }

  async deletePolicy(policyId: string) {
    return this.request<any>(`/questionnaires/policies/${policyId}`, {
      method: 'DELETE',
    });
  }

  // Questionnaires
  async getQuestionnaires() {
    return this.request<any>('/questionnaires/');
  }

  async deleteQuestionnaire(questionnaireId: string) {
    return this.request<any>(`/questionnaires/${questionnaireId}`, {
      method: 'DELETE',
    });
  }

  async getQuestions(questionnaireId: string) {
    return this.request<any>(`/questionnaires/${questionnaireId}/questions`);
  }

  async generateAnswers(questionnaireId: string) {
    return this.request<any>(`/questionnaires/${questionnaireId}/generate-answers`, {
      method: 'POST',
    });
  }

  async updateAnswer(questionId: string, answer: string, status: string = 'unapproved') {
    return this.request<any>(`/questionnaires/questions/${questionId}/answer`, {
      method: 'PUT',
      body: JSON.stringify({ answer, status }),
    });
  }

  async approveAnswer(questionId: string) {
    return this.request<any>(`/questionnaires/questions/${questionId}/approve`, {
      method: 'PUT',
    });
  }

  async bulkApproveAnswers(questionIds: string[], status: string) {
    return this.request<any>('/questionnaires/questions/bulk-approve', {
      method: 'PUT',
      body: JSON.stringify({ question_ids: questionIds, status }),
    });
  }

  async exportAnswers(questionnaireId: string) {
    return this.request<any>(`/questionnaires/${questionnaireId}/export`);
  }

  // Answers Library
  async getAnswers() {
    return this.request<any>('/answers/');
  }

  async createAnswer(question: string, answer: string) {
    return this.request<any>('/answers/', {
      method: 'POST',
      body: JSON.stringify({ question, answer }),
    });
  }

  async updateAnswerLibrary(answerId: string, question: string, answer: string) {
    return this.request<any>(`/answers/${answerId}`, {
      method: 'PUT',
      body: JSON.stringify({ question, answer }),
    });
  }

  async deleteAnswerLibrary(answerId: string) {
    return this.request<any>(`/answers/${answerId}`, {
      method: 'DELETE',
    });
  }

  async getAnswerById(answerId: string) {
    return this.request<any>(`/answers/${answerId}`);
  }

  async bulkImportAnswers(answers: Array<{ question: string; answer: string }>) {
    return this.request<any>('/answers/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }
}

export const api = new ApiClient();
