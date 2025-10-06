-- Answers Library Table Schema
-- This table stores user-created and imported answers for the answers library

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('user', 'questionnaire')),
  source_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);

-- Create index on source_type for filtering
CREATE INDEX IF NOT EXISTS idx_answers_source_type ON answers(source_type);

-- Enable Row Level Security (optional, for future auth implementation)
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (update when auth is implemented)
CREATE POLICY "Allow all operations on answers" ON answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

