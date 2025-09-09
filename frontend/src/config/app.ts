export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Summit Security Questionnaire',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
  allowedFileTypes: {
    pdf: ['.pdf'] as string[],
    excel: ['.xlsx', '.xls'] as string[],
  },
  features: {
    pdfUpload: true,
    excelUpload: true,
    aiGeneration: true,
    bulkOperations: true,
    export: true,
  },
};

export type AppConfig = typeof appConfig;
