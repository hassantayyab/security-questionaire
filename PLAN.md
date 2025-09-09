# Security Questionnaire App Development Plan

## Project Overview

Building a security questionnaire application similar to Vanta that automatically fills answers for questions based on uploaded policy documents using AI.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS v4
- **Backend**: Python with FastAPI
- **Database**: Supabase (PostgreSQL) with built-in auth & real-time
- **UI**: Tailwind CSS + shadcn/ui components
- **PDF Processing**: `PyPDF2` library for text extraction (Python backend)
- **Excel Processing**: `pandas` and `openpyxl` libraries for questionnaire parsing (Python backend)
- **AI Integration**: Claude Sonnet 4 API (Python backend)
- **File Storage**: FastAPI file handling with BytesIO for memory processing
- **Deployment**: Vercel (Frontend) + Python backend hosting (Render)

## Development Phases

### Phase 1: Project Foundation (Day 1)

**Frontend Setup:**

- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS and shadcn/ui
- [ ] Configure environment variables for backend API URL
- [ ] Set up Supabase client configuration for frontend
- [ ] Create basic project structure and routing

**Backend Setup:**

- [ ] Initialize Python FastAPI project
- [ ] Set up virtual environment and dependencies (PyPDF2, pandas, openpyxl, python-multipart)
- [ ] Configure environment variables for Claude API key and Supabase
- [ ] Set up CORS for frontend communication
- [ ] Create basic API structure and endpoints
- [ ] Set up Git repository

### Phase 2: Basic UI Structure (Day 1-2)

- [ ] Create main layout with two-tab structure
- [ ] Implement "Knowledge Base" tab UI
- [ ] Implement "Questions & Answers" tab UI
- [ ] Add basic navigation and styling
- [ ] Create reusable components (buttons, tables, file uploads)

### Phase 3: Knowledge Base - PDF Upload (Day 2-3)

**Frontend:**

- [ ] Create PDF file upload component
- [ ] Set up file validation (PDF only, size limits)
- [ ] Implement API calls to backend endpoints
- [ ] Display uploaded policies in table (name, date, size)

**Backend:**

- [ ] Create FastAPI endpoint for PDF upload (/upload/pdf)
- [ ] Implement UploadFile handling with multipart/form-data
- [ ] Set up file validation (PDF type, size limits)
- [ ] Create database schema for policies in Supabase
- [ ] Store policy metadata in database

### Phase 4: PDF Text Extraction (Day 3-4)

**Backend PDF Processing with PyPDF2:**

- [ ] Install and configure PyPDF2 library
- [ ] Create PDF text extraction service using BytesIO for memory processing
- [ ] Implement the following workflow:
  - [ ] Read uploaded PDF into BytesIO object
  - [ ] Use PyPDF2.PdfReader to process the PDF from memory
  - [ ] Loop through all pages to extract text
  - [ ] Concatenate all page text into a single string
- [ ] Store extracted text content in database
- [ ] Handle PDF extraction errors gracefully
- [ ] Return extraction status and text content to frontend

**Frontend:**

- [ ] Add text preview functionality
- [ ] Add loading states during processing
- [ ] Display extraction status and errors

### Phase 5: Questions Upload & Management (Day 4-5)

**Frontend:**

- [ ] Create Excel file upload component for questionnaires
- [ ] Implement API calls for Excel upload
- [ ] Display questions in table format
- [ ] Handle upload errors and status

**Backend:**

- [ ] Install and configure pandas and openpyxl libraries
- [ ] Create FastAPI endpoint for Excel upload (/upload/excel)
- [ ] Parse Excel files using pandas to extract questions
- [ ] Create database schema for questions and answers
- [ ] Store questions in database with questionnaire reference
- [ ] Handle Excel parsing errors gracefully

### Phase 6: AI Answer Generation (Day 5-6)

**Backend:**

- [ ] Set up Claude API integration in Python
- [ ] Create AI service for answer generation
- [ ] Implement prompt engineering for accurate answers
- [ ] Create endpoint for generating answers (/generate-answers)
- [ ] Generate answers using policy content and questions
- [ ] Store generated answers with "Unapproved" status
- [ ] Add retry mechanism for failed AI calls

**Frontend:**

- [ ] Create trigger button for AI answer generation
- [ ] Add loading states during AI processing
- [ ] Display generation progress and results

### Phase 7: Answer Review & Editing (Day 6-7)

- [ ] Make answer column editable in table
- [ ] Implement inline editing functionality
- [ ] Add save/cancel editing actions
- [ ] Create approve/unapprove functionality
- [ ] Update answer status in database
- [ ] Add bulk approval options

### Phase 8: Export Functionality (Day 7-8)

**Backend:**

- [ ] Create export service for approved answers
- [ ] Implement Excel export functionality using pandas
- [ ] Add PDF export option
- [ ] Create export endpoints (/export/excel, /export/pdf)
- [ ] Filter only approved answers for export
- [ ] Handle export errors gracefully

**Frontend:**

- [ ] Add export buttons and UI
- [ ] Implement file download triggers
- [ ] Add export loading states
- [ ] Handle download errors

### Phase 9: Error Handling & Validation (Day 8)

- [ ] Add comprehensive error handling
- [ ] Implement file validation (size, type, content)
- [ ] Add user feedback for all operations
- [ ] Create loading states for all async operations
- [ ] Add form validation where needed

### Phase 10: Testing & Polish (Day 8-9)

- [ ] Test complete workflow end-to-end
- [ ] Add responsive design improvements
- [ ] Optimize performance for large files
- [ ] Add progress indicators for long operations
- [ ] Test with various PDF and Excel formats
- [ ] Polish UI/UX details

### Phase 11: Deployment & Documentation (Day 9)

**Frontend Deployment:**
- [ ] Set up production environment variables for frontend
- [ ] Deploy Next.js app to Vercel
- [ ] Configure API base URLs for production

**Backend Deployment:**
- [ ] Set up production environment variables for Python backend
- [ ] Deploy FastAPI backend (Railway/Render/DigitalOcean)
- [ ] Configure CORS for production frontend domain
- [ ] Set up health check endpoints

**Documentation & Monitoring:**
- [ ] Create user documentation
- [ ] Set up monitoring and error tracking
- [ ] Create backup strategy for data
- [ ] Document API endpoints

## Database Schema (Supabase/PostgreSQL)

### Policies Table

```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT, -- Supabase Storage URL
  extracted_text TEXT,
  file_size INTEGER,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Questionnaires Table

```sql
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Questions Table

```sql
CREATE TYPE question_status AS ENUM ('unapproved', 'approved');

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  answer TEXT,
  status question_status DEFAULT 'unapproved',
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Features Breakdown

### Knowledge Base Tab

- File upload button for PDFs
- Table showing: Policy Name, Upload Date, File Size, Actions
- PDF text extraction and storage
- Delete policy functionality

### Questions & Answers Tab

- Excel file upload for questionnaires
- Table showing: Question, Answer, Status, Action
- Inline answer editing
- Approve/Unapprove buttons
- Bulk operations
- Export functionality

## AI Integration Details

- Use Claude Sonnet 4 for answer generation
- Pass complete policy text as context
- Prompt engineering for accurate, concise answers
- Second-person perspective answers
- Error handling for API failures
- Rate limiting considerations

## File Processing

- **PDF**: Use PyPDF2 for reliable text extraction with BytesIO memory processing
- **Excel**: Use pandas and openpyxl libraries for robust parsing
- **Validation**: File type, size, and content validation
- **Storage**: FastAPI file handling with temporary memory processing (no persistent file storage needed)

### PyPDF2 Implementation Workflow

The PDF processing follows this specific workflow using Python backend:

1. **File Upload**: PDF is uploaded via FastAPI's `UploadFile` parameter
2. **Memory Processing**: PDF content is read into a `BytesIO` object for in-memory processing
3. **Text Extraction**: `PyPDF2.PdfReader` processes the PDF directly from memory
4. **Page Iteration**: Loop through all pages using `reader.pages` to extract text from each page
5. **Text Concatenation**: Combine all page text into a single string for storage
6. **Database Storage**: Store the extracted text content in the database

**Required Libraries:**
- `PyPDF2` - For PDF reading and text extraction
- `io` (Python Standard Library) - For BytesIO memory handling

## Security Considerations

- Secure API key storage in environment variables
- File upload validation and sanitization
- Rate limiting for AI API calls
- Input sanitization for user edits
- Secure file storage and access

## Performance Optimizations

- Lazy loading for large tables
- Pagination for questions/policies
- Background processing for PDF extraction
- Caching for repeated AI calls
- Optimized database queries

## Future Enhancements (Post-MVP)

- Cloud storage integration (AWS S3, Google Cloud)
- User authentication and multi-tenancy
- Advanced AI models and custom training
- Bulk questionnaire processing
- API for integrations
- Advanced export formats
- Audit logs and version history
