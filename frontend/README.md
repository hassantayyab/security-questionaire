# Summit Security Questionnaire Frontend

Next.js 14 frontend application for the Summit Security Questionnaire system with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Component Library**: shadcn/ui components for consistent, accessible UI
- **File Upload**: Drag-and-drop PDF and Excel file uploads with react-dropzone
- **Real-time Feedback**: Toast notifications and loading states
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript integration with strict typing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp env-template.txt .env.local

# Edit .env.local with your configuration
nano .env.local
```

Required environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:8000)
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (http://localhost:8000/api)

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000 (must be running separately)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout with header/footer
│   │   ├── page.tsx            # Main page with tab interface
│   │   └── globals.css         # Global styles with Tailwind
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── KnowledgeBase.tsx   # PDF upload and policy management
│   │   ├── QuestionsAnswers.tsx # Excel upload and Q&A management
│   │   └── FileUpload.tsx      # Reusable file upload component
│   ├── lib/                    # Utilities and configuration
│   │   ├── api.ts              # API client for backend communication
│   │   └── utils.ts            # Utility functions (shadcn/ui)
│   ├── config/                 # Configuration files
│   │   └── app.ts              # App configuration and settings
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Shared types and interfaces
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Components Overview

### Main Layout

- **Header**: App title and branding
- **Footer**: Credits and links
- **Toast System**: Global notification system with Sonner

### Knowledge Base Tab

- **PDF Upload**: Drag-and-drop PDF file upload
- **Policy Management**: View uploaded policies with status
- **Text Extraction**: PyPDF2-based text extraction with progress
- **File Validation**: Type and size validation

### Questions & Answers Tab

- **Excel Upload**: Upload questionnaire Excel files
- **Question Display**: Table view of all questions
- **AI Generation**: Trigger AI answer generation
- **Answer Editing**: Inline editing of answers
- **Approval System**: Approve/unapprove individual or bulk answers
- **Export**: Download approved answers as CSV

### Reusable Components

- **FileUpload**: Configurable drag-and-drop file upload
- **shadcn/ui**: Button, Card, Table, Tabs, Input, Badge, Progress, etc.

## API Integration

The frontend communicates with the FastAPI backend through a centralized API client:

### Endpoints Used

- `POST /api/upload/pdf` - Upload PDF policies
- `POST /api/upload/excel` - Upload Excel questionnaires
- `GET /api/questionnaires/` - Get all questionnaires
- `GET /api/questionnaires/{id}/questions` - Get questions
- `POST /api/questionnaires/{id}/generate-answers` - Generate AI answers
- `PUT /api/questionnaires/questions/{id}/answer` - Update answer
- `PUT /api/questionnaires/questions/{id}/approve` - Approve answer
- `PUT /api/questionnaires/questions/bulk-approve` - Bulk operations
- `GET /api/questionnaires/{id}/export` - Export approved answers

### Error Handling

- Custom `ApiError` class for API errors
- Toast notifications for user feedback
- Loading states for async operations
- Form validation and file type checking

## Dependencies

### Core Dependencies

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework

### UI Components

- **shadcn/ui**: Modern component library
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Utilities

- **react-dropzone**: File upload functionality
- **class-variance-authority**: Component variants
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

### Code Style

- **ESLint**: Configured with Next.js rules
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (recommended)

### Adding New Components

```bash
# Add shadcn/ui components
npx shadcn@latest add [component-name]

# Example: Add dialog component
npx shadcn@latest add dialog
```

## Environment Variables

```bash
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="Summit Security Questionnaire"
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Optional: Direct Supabase access (if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify**: Static export or serverless
- **Railway**: Full-stack deployment
- **DigitalOcean App Platform**: Container deployment

## Browser Support

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

## Performance

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component (when needed)
- **Bundle Size**: Optimized with tree shaking
- **Loading States**: Skeleton screens and progress indicators
