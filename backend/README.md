# Summit Security Questionnaire API (Backend)

FastAPI backend for processing PDF policies and generating AI-powered questionnaire answers using PyPDF2 and Claude AI.

## Features

- **PDF Processing**: Extract text from PDF policies using PyPDF2 with BytesIO memory processing
- **Excel Processing**: Parse questionnaire files using openpyxl
- **AI Integration**: Generate answers using Anthropic Claude Sonnet 4
- **Database**: Supabase PostgreSQL for data storage
- **RESTful API**: Complete CRUD operations for policies and questionnaires

## Quick Start

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
cp env_template.txt .env

# Edit .env with your actual credentials
nano .env
```

Required environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `ANTHROPIC_API_KEY`: Your Anthropic API key

### 3. Start the Server

```bash
# Using the startup script
python start.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation

- **Main API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health & Status

- `GET /api/health` - Health check

### File Upload

- `POST /api/upload/pdf` - Upload and process PDF policy documents
- `POST /api/upload/excel` - Upload and process Excel questionnaires

### Questionnaires

- `GET /api/questionnaires/` - Get all questionnaires
- `GET /api/questionnaires/{id}/questions` - Get questions for a questionnaire
- `POST /api/questionnaires/{id}/generate-answers` - Generate AI answers
- `PUT /api/questionnaires/questions/{id}/answer` - Update answer
- `PUT /api/questionnaires/questions/{id}/approve` - Approve answer
- `PUT /api/questionnaires/questions/bulk-approve` - Bulk approve answers
- `GET /api/questionnaires/{id}/export` - Export approved answers

## PyPDF2 Implementation

The PDF processing follows this specific workflow:

1. **File Upload**: PDF uploaded via FastAPI's `UploadFile`
2. **Memory Processing**: PDF content read into `BytesIO` object
3. **Text Extraction**: `PyPDF2.PdfReader` processes PDF from memory
4. **Page Iteration**: Loop through all pages to extract text
5. **Text Concatenation**: Combine all page text into single string
6. **Database Storage**: Store extracted text in database

## Project Structure

```
backend/
├── app/
│   ├── api/                 # API route handlers
│   │   ├── health.py        # Health check endpoints
│   │   ├── upload.py        # File upload endpoints
│   │   └── questionnaires.py # Questionnaire management
│   ├── services/            # Business logic services
│   │   ├── pdf_processor.py # PyPDF2 text extraction
│   │   ├── excel_processor.py # Excel file processing
│   │   ├── ai_service.py    # Claude AI integration
│   │   └── database.py      # Supabase database operations
│   ├── config/              # Configuration settings
│   │   └── settings.py      # Pydantic settings
│   └── main.py              # FastAPI application setup
├── requirements.txt         # Python dependencies
├── start.py                # Development server startup script
├── env_template.txt        # Environment variables template
└── README.md               # This file
```

## Database Schema

The backend expects these Supabase tables:

### Policies Table

```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
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

## Development

### Running Tests

```bash
# TODO: Add test commands when tests are implemented
```

### Code Formatting

```bash
# Install development dependencies
pip install black isort flake8

# Format code
black .
isort .

# Check code quality
flake8 .
```

## Deployment

The backend can be deployed to any Python hosting service:

- **Railway**: `railway deploy`
- **Render**: Connect GitHub repository
- **DigitalOcean App Platform**: Use app spec
- **AWS/Google Cloud**: Use containerized deployment

## Dependencies

Key libraries used:

- **FastAPI**: Modern web framework
- **PyPDF2**: PDF text extraction
- **openpyxl**: Excel file processing
- **anthropic**: Claude AI API client
- **supabase**: Database client
- **uvicorn**: ASGI server
