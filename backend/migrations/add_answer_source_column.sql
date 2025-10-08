-- =====================================================
-- Migration: Add answer_source column to questions table
-- =====================================================
-- This migration adds an answer_source column to track the origin of answers
-- Run this in your Supabase SQL Editor

-- Add answer_source column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS answer_source TEXT;

-- Add a check constraint to ensure valid values
ALTER TABLE questions
ADD CONSTRAINT questions_answer_source_check 
CHECK (answer_source IN ('ai', 'user', 'copied', 'not_found') OR answer_source IS NULL);

-- Create an index for faster queries on answer_source
CREATE INDEX IF NOT EXISTS idx_questions_answer_source ON questions(answer_source);

-- Optional: Add a comment to document the column
COMMENT ON COLUMN questions.answer_source IS 'Tracks the source of the answer: ai (AI-generated), user (manually entered), copied (from previous questionnaire), not_found (AI could not find answer)';

-- Verify the column was added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'questions' AND column_name = 'answer_source';

