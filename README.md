# Summit Security Questionnaire

AI-powered security questionnaire application that automates policy analysis and compliance reporting using FastAPI and Next.js.

![Project Status](https://img.shields.io/badge/status-development-yellow)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Git** for version control

### One-Command Setup & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd cool-summit-app

# Install the concurrently package globally (one-time setup)
npm install

# Setup environment files and install all dependencies
npm run setup

# Start both backend and frontend simultaneously
npm run dev
```

That's it! Your application will be running at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 Features

- 📄 **PDF Policy Processing**: Extract text from security policies using PyPDF2
- 📊 **Excel Questionnaire Import**: Parse questionnaires with openpyxl
- 🤖 **AI-Powered Answers**: Generate responses using Anthropic Claude Sonnet 4
- ✅ **Review & Approval Workflow**: Edit and approve AI-generated answers
- 📈 **Bulk Operations**: Approve/unapprove multiple answers at once
- 📁 **CSV Export**: Export approved answers for compliance reporting
- 🎨 **Modern UI**: Responsive design with Tailwind CSS and shadcn/ui
- 🔄 **Real-time Updates**: Live feedback and progress indicators

## 🏗️ Architecture

```
Summit Security Questionnaire
├── 🐍 Backend (FastAPI)         ← Python API server
│   ├── PDF text extraction
│   ├── Excel parsing
│   ├── AI integration
│   └── Database operations
│
├── ⚛️  Frontend (Next.js)        ← React web application
│   ├── File upload interface
│   ├── Question management
│   ├── Answer review system
│   └── Export functionality
│
└── 🗄️  Database (Supabase)       ← PostgreSQL database
    ├── Policies storage
    ├── Questionnaires
    └── Questions & answers
```

## 🛠️ Available Commands

### Development

```bash
# Start both applications in development mode
npm run dev

# Start only backend (FastAPI with auto-reload)
npm run dev:backend

# Start only frontend (Next.js with Turbopack)
npm run dev:frontend
```

### Production

```bash
# Build both applications
npm run build

# Start both applications in production mode
npm run start
```

### Setup & Installation

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Install only backend dependencies
npm run install:backend

# Install only frontend dependencies
npm run install:frontend

# Complete setup with environment files
npm run setup

# Clean all build files and dependencies
npm run clean
```

## ⚙️ Environment Configuration

After running `npm run setup`, you'll have template environment files. Update them with your actual credentials:

### Backend Environment (`backend/.env`)

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Anthropic AI Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Server Configuration (optional)
PORT=8000
HOST=0.0.0.0
```

### Frontend Environment (`frontend/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=Summit Security Questionnaire
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

## 📊 Database Setup

The application uses Supabase as the database. Run these SQL commands in your Supabase SQL editor:

```sql
-- Policies table
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

-- Questionnaires table
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table with status enum
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

## 🔧 Manual Setup (Alternative)

If you prefer to set up each component manually:

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp env_template.txt .env
# Edit .env with your credentials

# Start the server
python start.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp env-template.txt .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## 📁 Project Structure

```
cool-summit-app/
├── README.md                    # This file
├── package.json                 # Root package with scripts
├── PLAN.md                      # Development plan
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── config/              # Configuration
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt         # Python dependencies
│   ├── start.py                 # Server startup script
│   └── README.md                # Backend documentation
│
└── frontend/                    # Next.js frontend
    ├── src/
    │   ├── app/                 # Next.js app router
    │   ├── components/          # React components
    │   ├── lib/                 # Utilities and API client
    │   └── types/               # TypeScript types
    ├── package.json             # Frontend dependencies
    └── tailwind.config.js       # Tailwind CSS config
```

## 🔄 Workflow

1. **Upload Policies**: Drag & drop PDF files containing security policies
2. **Import Questions**: Upload Excel files with questionnaires
3. **Generate Answers**: Use AI to automatically generate answers based on policies
4. **Review & Edit**: Manually review and edit AI-generated responses
5. **Approve Answers**: Mark answers as approved for final export
6. **Export Results**: Download CSV files with approved answers

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel via GitHub integration
```

### Backend (Railway/Render)

```bash
cd backend
# Deploy via platform-specific instructions
# Ensure environment variables are configured
```

## 🛠️ Development

### Tech Stack

- **Backend**: Python, FastAPI, PyPDF2, openpyxl, Anthropic AI
- **Frontend**: TypeScript, Next.js 14, React 19, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **File Processing**: PyPDF2 (PDF), openpyxl (Excel)

### Code Style

- **Python**: Black formatter, isort imports, flake8 linting
- **TypeScript**: ESLint, Prettier, strict TypeScript
- **CSS**: Tailwind CSS with component-based architecture

## 🔍 Troubleshooting

### Common Issues

**Backend not starting?**

- Check if Python 3.9+ is installed: `python3 --version`
- Ensure virtual environment is activated
- Verify all environment variables are set

**Frontend build errors?**

- Check if Node.js 18+ is installed: `node --version`
- Clear cache: `rm -rf frontend/.next frontend/node_modules`
- Reinstall: `cd frontend && npm install`

**Database connection issues?**

- Verify Supabase URL and key in environment files
- Check if database tables are created
- Ensure network connectivity

**File upload not working?**

- Check file size limits in configuration
- Verify file types are supported (.pdf, .xlsx, .xls)
- Check browser console for errors

### Getting Help

1. Check the [PLAN.md](./PLAN.md) for development status
2. Review backend logs in terminal
3. Check browser developer tools for frontend issues
4. Verify environment configuration

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request

---

**Ready to start?** Run `npm run dev` and visit http://localhost:3000 🚀
