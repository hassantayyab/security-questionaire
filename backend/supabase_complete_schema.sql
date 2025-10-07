-- =====================================================
-- Complete Database Schema for Security Questionnaire App
-- =====================================================
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables, indexes, RLS policies, and triggers

-- =====================================================
-- 1. POLICIES TABLE
-- =====================================================
-- Stores uploaded policy documents and their extracted text

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  extracted_text TEXT,
  file_size INTEGER,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for policies table
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policies_upload_date ON policies(upload_date DESC);

-- Enable Row Level Security on policies
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create policy for policies table (allow all operations for now)
CREATE POLICY "Allow all operations on policies" ON policies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. QUESTIONNAIRES TABLE
-- =====================================================
-- Stores uploaded questionnaire metadata

CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for questionnaires table
CREATE INDEX IF NOT EXISTS idx_questionnaires_created_at ON questionnaires(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questionnaires_upload_date ON questionnaires(upload_date DESC);

-- Enable Row Level Security on questionnaires
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- Create policy for questionnaires table (allow all operations for now)
CREATE POLICY "Allow all operations on questionnaires" ON questionnaires
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. QUESTIONS TABLE
-- =====================================================
-- Stores questions from questionnaires with their answers and approval status

-- Create ENUM type for question status
DO $$ BEGIN
  CREATE TYPE question_status AS ENUM ('unapproved', 'approved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  answer TEXT,
  status question_status DEFAULT 'unapproved',
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for questions table
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- Enable Row Level Security on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policy for questions table (allow all operations for now)
CREATE POLICY "Allow all operations on questions" ON questions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. ANSWERS LIBRARY TABLE
-- =====================================================
-- Stores user-created and imported answers for the answers library

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'user' CHECK (source_type IN ('user', 'questionnaire')),
  source_name TEXT NOT NULL DEFAULT 'User',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for answers table
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_source_type ON answers(source_type);

-- Enable Row Level Security on answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policy for answers table (allow all operations for now)
CREATE POLICY "Allow all operations on answers" ON answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for policies table
DROP TRIGGER IF EXISTS update_policies_updated_at ON policies;
CREATE TRIGGER update_policies_updated_at 
  BEFORE UPDATE ON policies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for questionnaires table
DROP TRIGGER IF EXISTS update_questionnaires_updated_at ON questionnaires;
CREATE TRIGGER update_questionnaires_updated_at 
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for questions table
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for answers table
DROP TRIGGER IF EXISTS update_answers_updated_at ON answers;
CREATE TRIGGER update_answers_updated_at 
  BEFORE UPDATE ON answers
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify everything was created successfully

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check policies table
-- SELECT * FROM policies LIMIT 1;

-- Check questionnaires table
-- SELECT * FROM questionnaires LIMIT 1;

-- Check questions table
-- SELECT * FROM questions LIMIT 1;

-- Check answers table
-- SELECT * FROM answers LIMIT 1;

-- =====================================================
-- SCHEMA SETUP COMPLETE
-- =====================================================
-- All tables, indexes, RLS policies, and triggers have been created.
-- You can now connect your backend to this Supabase database.
