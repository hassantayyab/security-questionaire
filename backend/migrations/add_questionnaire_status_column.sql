-- Migration: Add status column to questionnaires table
-- Date: 2025-10-07
-- Description: Adds status tracking for questionnaires (in_progress, approved, complete)

-- Create ENUM type for questionnaire status
DO $$ BEGIN
  CREATE TYPE questionnaire_status AS ENUM ('in_progress', 'approved', 'complete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column to questionnaires table
ALTER TABLE questionnaires 
ADD COLUMN IF NOT EXISTS status questionnaire_status DEFAULT 'in_progress';

-- Create index for status column
CREATE INDEX IF NOT EXISTS idx_questionnaires_status ON questionnaires(status);

-- Update existing questionnaires to have 'in_progress' status
UPDATE questionnaires 
SET status = 'in_progress' 
WHERE status IS NULL;

