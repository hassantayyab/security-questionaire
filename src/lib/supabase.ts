import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Policy {
  id: string
  name: string
  filename: string
  file_path?: string
  file_url?: string
  extracted_text?: string
  file_size: number
  upload_date: string
  created_at: string
  updated_at: string
}

export interface Questionnaire {
  id: string
  name: string
  filename: string
  upload_date: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  question_text: string
  answer?: string
  status: 'unapproved' | 'approved'
  questionnaire_id: string
  created_at: string
  updated_at: string
}
