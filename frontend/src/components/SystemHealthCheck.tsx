'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { appConfig } from '@/config/app';
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface HealthCheck {
  status: string;
  timestamp: string;
  checks: {
    api: { status: string };
    database: { status: string; message?: string };
    ai_service: { status: string; message?: string; model?: string };
  };
}

interface AITestResult {
  success: boolean;
  message: string;
  test_question: string;
  test_answer: string;
  model: string;
}

export const SystemHealthCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [aiTestResult, setAiTestResult] = useState<AITestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setHealthStatus(null);
    setAiTestResult(null);

    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/health/full`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(`Failed to connect to backend: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const runAITest = async () => {
    setLoading(true);
    setError(null);
    setAiTestResult(null);

    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/health/ai-test`);
      const data = await response.json();

      if (response.ok) {
        setAiTestResult(data);
      } else {
        setError(data.detail || 'AI test failed');
      }
    } catch (err) {
      setError(`Failed to test AI service: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />;
      case 'error':
        return <XCircle className='h-5 w-5 text-red-500' />;
      case 'degraded':
      case 'unknown':
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
      default:
        return <AlertCircle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'degraded':
      case 'unknown':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <Button onClick={runHealthCheck} disabled={loading} className='flex items-center gap-2'>
          {loading ? (
            <div className='w-4 h-4'>
              <svg
                className='animate-spin'
                viewBox='0 0 16 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='8' cy='8' r='6' stroke='currentColor' strokeWidth='2' fill='none' opacity='0.25' />
                <path
                  d='M 14 8 A 6 6 0 0 1 8 14'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  fill='none'
                />
              </svg>
            </div>
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          Check System Health
        </Button>

        <Button
          onClick={runAITest}
          disabled={loading}
          variant='outline'
          className='flex items-center gap-2'
        >
          {loading ? (
            <div className='w-4 h-4'>
              <svg
                className='animate-spin'
                viewBox='0 0 16 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='8' cy='8' r='6' stroke='currentColor' strokeWidth='2' fill='none' opacity='0.25' />
                <path
                  d='M 14 8 A 6 6 0 0 1 8 14'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  fill='none'
                />
              </svg>
            </div>
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          Test AI Service
        </Button>
      </div>

      {error && (
        <Card className='p-4 border-red-200 bg-red-50'>
          <div className='flex items-start gap-3'>
            <XCircle className='h-5 w-5 text-red-500 mt-0.5' />
            <div>
              <h3 className='font-semibold text-red-900'>Error</h3>
              <p className='text-sm text-red-700 mt-1'>{error}</p>
            </div>
          </div>
        </Card>
      )}

      {healthStatus && (
        <Card className='p-4'>
          <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
            {getStatusIcon(healthStatus.status)}
            System Status: {healthStatus.status.toUpperCase()}
          </h3>

          <div className='space-y-3'>
            {/* API Status */}
            <div
              className={`p-3 rounded-lg border ${getStatusColor(healthStatus.checks.api.status)}`}
            >
              <div className='flex items-center gap-2'>
                {getStatusIcon(healthStatus.checks.api.status)}
                <span className='font-medium'>API Server</span>
              </div>
              <p className='text-sm mt-1'>Status: {healthStatus.checks.api.status}</p>
            </div>

            {/* Database Status */}
            <div
              className={`p-3 rounded-lg border ${getStatusColor(
                healthStatus.checks.database.status,
              )}`}
            >
              <div className='flex items-center gap-2'>
                {getStatusIcon(healthStatus.checks.database.status)}
                <span className='font-medium'>Database (Supabase)</span>
              </div>
              <p className='text-sm mt-1'>Status: {healthStatus.checks.database.status}</p>
              {healthStatus.checks.database.message && (
                <p className='text-xs mt-1 font-mono'>{healthStatus.checks.database.message}</p>
              )}
            </div>

            {/* AI Service Status */}
            <div
              className={`p-3 rounded-lg border ${getStatusColor(
                healthStatus.checks.ai_service.status,
              )}`}
            >
              <div className='flex items-center gap-2'>
                {getStatusIcon(healthStatus.checks.ai_service.status)}
                <span className='font-medium'>AI Service (Anthropic)</span>
              </div>
              <p className='text-sm mt-1'>Status: {healthStatus.checks.ai_service.status}</p>
              {healthStatus.checks.ai_service.message && (
                <p className='text-xs mt-1 font-mono'>{healthStatus.checks.ai_service.message}</p>
              )}
              {healthStatus.checks.ai_service.model && (
                <p className='text-sm mt-1 text-gray-600'>
                  Model: {healthStatus.checks.ai_service.model}
                </p>
              )}
            </div>
          </div>

          <div className='mt-4 text-xs text-gray-500'>
            Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
          </div>
        </Card>
      )}

      {aiTestResult && (
        <Card className='p-4 border-green-200 bg-green-50'>
          <div className='flex items-start gap-3'>
            <CheckCircle2 className='h-5 w-5 text-green-500 mt-0.5' />
            <div className='flex-1'>
              <h3 className='font-semibold text-green-900'>AI Service Test Successful</h3>
              <p className='text-sm text-green-700 mt-1'>{aiTestResult.message}</p>
              <div className='mt-3 space-y-2'>
                <div className='text-sm'>
                  <span className='font-medium'>Model:</span> {aiTestResult.model}
                </div>
                <div className='text-sm'>
                  <span className='font-medium'>Test Question:</span> {aiTestResult.test_question}
                </div>
                <div className='text-sm bg-white p-2 rounded border border-green-200'>
                  <span className='font-medium'>Test Answer:</span>
                  <p className='mt-1 text-gray-700'>{aiTestResult.test_answer}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className='p-4 bg-blue-50 border-blue-200'>
        <h4 className='font-semibold text-blue-900 mb-2'>Troubleshooting Tips</h4>
        <ul className='text-sm text-blue-800 space-y-2 list-disc list-inside'>
          <li>If API Server shows error: Make sure the backend server is running on port 8000</li>
          <li>If Database shows error: Check your Supabase credentials in backend/.env</li>
          <li>If AI Service shows error: Verify ANTHROPIC_API_KEY is set in backend/.env</li>
          <li>
            AI key not configured: Create a .env file in the backend folder with ANTHROPIC_API_KEY
          </li>
          <li>Check backend terminal logs for detailed error messages</li>
        </ul>
      </Card>
    </div>
  );
};
