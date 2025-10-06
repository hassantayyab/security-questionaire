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

- [x] Initialize Next.js project with TypeScript
- [x] Set up Tailwind CSS and shadcn/ui
- [x] Configure environment variables for backend API URL
- [x] Set up Supabase client configuration for frontend
- [x] Create basic project structure and routing

**Backend Setup:**

- [x] Initialize Python FastAPI project
- [x] Set up virtual environment and dependencies (PyPDF2, pandas, openpyxl, python-multipart)
- [x] Configure environment variables for Claude API key and Supabase
- [x] Set up CORS for frontend communication
- [x] Create basic API structure and endpoints
- [x] Set up Git repository

### Phase 2: Basic UI Structure (Day 1-2)

- [x] Create main layout with two-tab structure
- [x] Implement "Knowledge Base" tab UI
- [x] Implement "Questions & Answers" tab UI
- [x] Add basic navigation and styling
- [x] Create reusable components (buttons, tables, file uploads)
- [x] Implement sidebar navigation following Figma design system
  - [x] Created `SidebarNavigation` component with section support
  - [x] Created `SidebarNavigationItem` with icons and active states
  - [x] Created `SidebarNavigationSection` for grouped navigation
  - [x] Added TypeScript types for navigation structure
  - [x] Integrated with main page layout
  - [x] Used lucide-react icons (FolderOpen, HelpCircle)
  - [x] Applied Secfix Tailwind design system styles

### Phase 3: Knowledge Base - PDF Upload (Day 2-3)

**Frontend:**

- [x] Create PDF file upload component
- [x] Set up file validation (PDF only, size limits)
- [x] Implement API calls to backend endpoints
- [x] Display uploaded policies in table (name, date, size)

**Backend:**

- [x] Create FastAPI endpoint for PDF upload (/upload/pdf)
- [x] Implement UploadFile handling with multipart/form-data
- [x] Set up file validation (PDF type, size limits)
- [ ] Create database schema for policies in Supabase
- [x] Store policy metadata in database

### Phase 4: PDF Text Extraction (Day 3-4)

**Backend PDF Processing with PyPDF2:**

- [x] Install and configure PyPDF2 library
- [x] Create PDF text extraction service using BytesIO for memory processing
- [x] Implement the following workflow:
  - [x] Read uploaded PDF into BytesIO object
  - [x] Use PyPDF2.PdfReader to process the PDF from memory
  - [x] Loop through all pages to extract text
  - [x] Concatenate all page text into a single string
- [x] Store extracted text content in database
- [x] Handle PDF extraction errors gracefully
- [x] Return extraction status and text content to frontend

**Frontend:**

- [x] Add text preview functionality
- [x] Add loading states during processing
- [x] Display extraction status and errors

### Phase 5: Questions Upload & Management (Day 4-5)

**Frontend:**

- [x] Create Excel file upload component for questionnaires
- [x] Implement API calls for Excel upload
- [x] Display questions in table format
- [x] Handle upload errors and status

**Backend:**

- [x] Install and configure openpyxl libraries
- [x] Create FastAPI endpoint for Excel upload (/upload/excel)
- [x] Parse Excel files using openpyxl to extract questions
- [ ] Create database schema for questions and answers
- [x] Store questions in database with questionnaire reference
- [x] Handle Excel parsing errors gracefully

### Phase 6: AI Answer Generation (Day 5-6)

**Backend:**

- [x] Set up Claude API integration in Python
- [x] Create AI service for answer generation
- [x] Implement prompt engineering for accurate answers
- [x] Create endpoint for generating answers (/generate-answers)
- [x] Generate answers using policy content and questions
- [x] Store generated answers with "Unapproved" status
- [x] Add retry mechanism for failed AI calls

**Frontend:**

- [x] Create trigger button for AI answer generation
- [x] Add loading states during AI processing
- [x] Display generation progress and results

### Phase 7: Answer Review & Editing (Day 6-7)

**Frontend:**

- [x] Make answer column editable in table
- [x] Implement inline editing functionality
- [x] Add save/cancel editing actions
- [x] Create approve/unapprove functionality UI
- [x] Add bulk approval options

**Backend:**

- [x] Create endpoints for answer updates (/answers/{id})
- [x] Create endpoints for status changes (/answers/{id}/approve)
- [x] Implement bulk operations endpoint
- [x] Update answer status in database
- [x] Add validation for answer updates

### Phase 8: Export Functionality (Day 7-8)

**Backend:**

- [x] Create export service for approved answers
- [x] Implement Excel export functionality using openpyxl
- [ ] Add PDF export option
- [x] Create export endpoints (/export/excel, /export/pdf)
- [x] Filter only approved answers for export
- [x] Handle export errors gracefully

**Frontend:**

- [x] Add export buttons and UI
- [x] Implement file download triggers
- [x] Add export loading states
- [x] Handle download errors

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
- [ ] Deploy FastAPI backend (Render)
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

### Answers Library Table

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('user', 'questionnaire')),
  source_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);
CREATE INDEX idx_answers_source_type ON answers(source_type);
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

### Answers Library

- Create and save question-answer pairs manually
- Import answers from processed questionnaires
- View saved answers in a searchable table
- Update and delete answers
- Track answer source (user or questionnaire)
- Search and filter functionality

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
