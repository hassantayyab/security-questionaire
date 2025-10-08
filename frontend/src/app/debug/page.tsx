'use client';

import AppLayout from '@/components/AppLayout';
import { SystemHealthCheck } from '@/components/SystemHealthCheck';
import { Card } from '@/components/ui/card';
import React from 'react';

const DebugPage: React.FC = () => {
  return (
    <AppLayout>
      <div className='max-w-4xl mx-auto p-6 space-y-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>System Diagnostics</h1>
          <p className='text-gray-600 mt-2'>
            Use this page to diagnose issues with AI answer generation and check system health.
          </p>
        </div>

        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Health Check</h2>
          <p className='text-gray-600 mb-6'>
            Run these checks to verify that all system components are working correctly:
          </p>
          <SystemHealthCheck />
        </Card>

        <Card className='p-6 bg-gray-50'>
          <h2 className='text-xl font-semibold mb-4'>Common Issues & Solutions</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='font-semibold text-gray-900'>AI answers not generating?</h3>
              <ul className='list-disc list-inside text-sm text-gray-700 mt-2 space-y-1'>
                <li>Check if ANTHROPIC_API_KEY is set in backend/.env</li>
                <li>Verify the API key is valid by clicking &ldquo;Test AI Service&rdquo;</li>
                <li>Check backend terminal logs for error messages</li>
                <li>Ensure policy documents have been uploaded and processed</li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold text-gray-900'>Backend not responding?</h3>
              <ul className='list-disc list-inside text-sm text-gray-700 mt-2 space-y-1'>
                <li>Verify backend server is running on port 8000</li>
                <li>Check if http://localhost:8000 is accessible</li>
                <li>Review backend startup logs for errors</li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold text-gray-900'>Database errors?</h3>
              <ul className='list-disc list-inside text-sm text-gray-700 mt-2 space-y-1'>
                <li>Verify SUPABASE_URL and SUPABASE_KEY in backend/.env</li>
                <li>Check if Supabase project is active</li>
                <li>Ensure database schema is properly set up</li>
              </ul>
            </div>

            <div className='pt-4 border-t border-gray-200'>
              <h3 className='font-semibold text-gray-900 mb-2'>Setting up .env file</h3>
              <p className='text-sm text-gray-700 mb-2'>
                Create a <code className='bg-gray-200 px-1 rounded'>.env</code> file in the{' '}
                <code className='bg-gray-200 px-1 rounded'>backend/</code> folder with:
              </p>
              <pre className='bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto'>
                {`ANTHROPIC_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DebugPage;
