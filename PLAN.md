# Security Questionnaire App Development Plan

## Project Overview

Building a security questionnaire application similar to Vanta that automatically fills answers for questions based on uploaded policy documents using AI.

## Tech Stack

- **Frontend/Backend**: Next.js 14 with TypeScript and App Router
- **Database**: Supabase (PostgreSQL) with built-in auth & real-time
- **UI**: Tailwind CSS + shadcn/ui components
- **PDF Processing**: `pdf-parse` library for text extraction
- **Excel Processing**: `xlsx` library for questionnaire parsing
- **AI Integration**: Claude Sonnet 4 API
- **File Storage**: Supabase Storage (cloud-native)
- **Deployment**: Vercel with Supabase backend

## Development Phases

### Phase 1: Project Foundation (Day 1)

- [x] Initialize Next.js project with TypeScript
- [x] Set up Tailwind CSS and shadcn/ui
- [x] Configure environment variables for Claude API key
- [ ] Set up Supabase database and client configuration
- [x] Create basic project structure and routing
- [x] Set up Git repository

### Phase 2: Basic UI Structure (Day 1-2)

- [x] Create main layout with two-tab structure
- [x] Implement "Knowledge Base" tab UI
- [x] Implement "Questions & Answers" tab UI
- [x] Add basic navigation and styling
- [x] Create reusable components (buttons, tables, file uploads)

### Phase 3: Knowledge Base - PDF Upload (Day 2-3)

- [ ] Create PDF file upload component
- [ ] Set up file validation (PDF only, size limits)
- [ ] Implement file upload API endpoint
- [ ] Create database schema for policies
- [ ] Store uploaded PDF files locally
- [ ] Display uploaded policies in table (name, date, size)

### Phase 4: PDF Text Extraction (Day 3-4)

- [ ] Install and configure pdf-parse library
- [ ] Create PDF text extraction service
- [ ] Extract and store full text content in database
- [ ] Add text preview functionality
- [ ] Handle PDF extraction errors gracefully
- [ ] Add loading states during processing

### Phase 5: Questions Upload & Management (Day 4-5)

- [ ] Create Excel file upload component for questionnaires
- [ ] Install and configure xlsx library
- [ ] Parse Excel files to extract questions
- [ ] Create database schema for questions and answers
- [ ] Display questions in table format
- [ ] Handle Excel parsing errors

### Phase 6: AI Answer Generation (Day 5-6)

- [ ] Set up Claude API integration
- [ ] Create AI service for answer generation
- [ ] Implement prompt engineering for accurate answers
- [ ] Generate answers using policy content and questions
- [ ] Store generated answers with "Unapproved" status
- [ ] Add retry mechanism for failed AI calls

### Phase 7: Answer Review & Editing (Day 6-7)

- [ ] Make answer column editable in table
- [ ] Implement inline editing functionality
- [ ] Add save/cancel editing actions
- [ ] Create approve/unapprove functionality
- [ ] Update answer status in database
- [ ] Add bulk approval options

### Phase 8: Export Functionality (Day 7-8)

- [ ] Create export service for approved answers
- [ ] Implement Excel export functionality
- [ ] Add PDF export option
- [ ] Filter only approved answers for export
- [ ] Add download triggers and file generation
- [ ] Handle export errors gracefully

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

- [ ] Set up production environment variables
- [ ] Deploy to Vercel or similar platform
- [ ] Create user documentation
- [ ] Set up monitoring and error tracking
- [ ] Create backup strategy for data

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

- **PDF**: Use pdf-parse for reliable text extraction
- **Excel**: Use xlsx library for robust parsing
- **Validation**: File type, size, and content validation
- **Storage**: Supabase Storage with organized bucket structure

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
