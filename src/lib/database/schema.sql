-- Security Questionnaire App Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Create custom types
CREATE TYPE question_status AS ENUM ('unapproved', 'approved');

-- Policies table for storing uploaded policy documents
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT, -- Supabase Storage URL
  extracted_text TEXT,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questionnaires table for storing uploaded questionnaire files
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table for storing individual questions and their AI-generated answers
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  answer TEXT,
  status question_status DEFAULT 'unapproved',
  questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_upload_date ON policies(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_questionnaires_upload_date ON questionnaires(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
-- For now, allow all operations (you can restrict this later with authentication)
CREATE POLICY "Allow all operations on policies" ON policies FOR ALL USING (true);
CREATE POLICY "Allow all operations on questionnaires" ON questionnaires FOR ALL USING (true);
CREATE POLICY "Allow all operations on questions" ON questions FOR ALL USING (true);

-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('policy-documents', 'policy-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for policy documents
CREATE POLICY "Allow public access to policy documents" ON storage.objects 
FOR ALL USING (bucket_id = 'policy-documents');

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_policies_updated_at 
    BEFORE UPDATE ON policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at 
    BEFORE UPDATE ON questionnaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
