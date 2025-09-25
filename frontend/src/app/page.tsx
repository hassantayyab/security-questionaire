'use client';

import {
  AppButton,
  KnowledgeBase,
  QuestionsAnswers,
  SearchField,
  TabNavigation,
  UploadDialog,
} from '@/components';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';

type TabType = 'knowledge-base' | 'questions-answers';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge-base');
  const [searchTerm, setSearchTerm] = useState('');
  const knowledgeBaseRef = useRef<any>(null);

  // Mock counts - in real app these would come from API/state
  const knowledgeBaseCount = 4; // Number of uploaded policies
  const questionsCount = 9; // Number of questions

  return (
    <div className='max-w-7xl mx-auto space-y-8 p-6'>
      {/* Header */}
      <div className='space-y-6'>
        {/* Frameworks/Tabs Section */}
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-900 mb-2'>Security Questionnaire</h2>
          <p className='text-sm text-gray-500 mt-2 mb-8'>
            Upload your security policies and questionnaires to automatically generate AI-powered
            answers using advanced document analysis.
          </p>

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            knowledgeBaseCount={knowledgeBaseCount}
            questionsCount={questionsCount}
          />

          {/* Search Bar and Upload Dialog */}
          <div className='flex items-center justify-between w-full'>
            <div className='max-w-md'>
              <SearchField placeholder='Search' value={searchTerm} onChange={setSearchTerm} />
            </div>
            <UploadDialog
              onUploadSuccess={() => {
                knowledgeBaseRef.current?.handleUploadSuccess();
              }}
            >
              <AppButton variant='primary'>
                <Plus className='h-4 w-4 mr-2' />
                Add Resource
              </AppButton>
            </UploadDialog>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className='space-y-6'>
        {activeTab === 'knowledge-base' && <KnowledgeBase ref={knowledgeBaseRef} />}
        {activeTab === 'questions-answers' && <QuestionsAnswers />}
      </div>
    </div>
  );
}
