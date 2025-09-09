# Security Questionnaire App

A modern web application for automating security questionnaires using AI-powered document analysis. Upload policy documents and generate accurate answers to security questions automatically.

## Features

- 📄 **PDF Policy Upload**: Upload and extract text from policy documents
- 📊 **Excel Questionnaire Processing**: Parse Excel files with security questions
- 🤖 **AI-Powered Answers**: Generate accurate answers using Claude Sonnet 4
- ✏️ **Answer Review & Editing**: Edit and approve AI-generated responses
- 📤 **Export Functionality**: Export approved answers to Excel/PDF
- 🗄️ **Cloud Storage**: Secure file storage with Supabase

## Tech Stack

- **Frontend/Backend**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + Radix UI components
- **PDF Processing**: pdf-parse library
- **Excel Processing**: xlsx library
- **AI**: Claude Sonnet 4 API
- **Storage**: Supabase Storage

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Claude API key

### 1. Clone and Install

```bash
git clone https://github.com/hassantayyab/security-questionaire.git
cd cool-summit-app
npm install
```

### 2. Environment Setup

Create `.env.local` file in the project root:

```env
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema** by copying the contents of `src/lib/database/schema.sql` and pasting it in your Supabase SQL editor

3. **Create storage bucket**: The schema will automatically create a `policy-documents` bucket for PDF storage

4. **Get your credentials**:
   - Go to Project Settings → API
   - Copy the Project URL and anon public key
   - Add them to your `.env.local` file

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Knowledge Base Tab

1. **Upload PDFs**: Click the upload area or drag & drop PDF files
2. **Text Extraction**: The app automatically extracts text from uploaded policies
3. **View Policies**: See all uploaded policies with upload dates and file sizes
4. **Delete Policies**: Remove policies and their associated files

### Questions & Answers Tab

1. **Upload Questionnaire**: Upload Excel files containing security questions
2. **AI Generation**: Questions are automatically answered using uploaded policies
3. **Review & Edit**: Edit AI-generated answers as needed
4. **Approve Answers**: Mark answers as approved for export
5. **Export**: Download approved answers in Excel or PDF format

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/        # React components
├── lib/
│   ├── database/      # Database schemas
│   ├── services/      # Business logic
│   └── supabase.ts    # Supabase client
└── types/             # TypeScript types
```

## Database Schema

The application uses three main tables:

- **policies**: Store PDF metadata and extracted text
- **questionnaires**: Track uploaded Excel questionnaires
- **questions**: Individual questions with AI-generated answers

See `src/lib/database/schema.sql` for the complete schema.

## Development Roadmap

### ✅ Completed Phases
- [x] Project foundation with Next.js and TypeScript
- [x] Basic UI structure with tab navigation
- [x] Knowledge base with PDF upload functionality
- [x] Database setup and Supabase integration

### 🚧 In Progress
- [ ] Excel questionnaire processing
- [ ] AI answer generation with Claude
- [ ] Answer review and approval system

### 📋 Upcoming
- [ ] Export functionality (Excel/PDF)
- [ ] Advanced error handling
- [ ] Performance optimizations
- [ ] User authentication
- [ ] Multi-tenancy support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

Built with ❤️ using Next.js, Supabase, and Claude AI
