'use client';

import { KnowledgeBase, QuestionsAnswers, TabNavigation } from '@/components';
import { useRef, useState } from 'react';

type TabType = 'knowledge-base' | 'questions-answers';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge-base');
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
          <div className='space-y-1 mb-8 max-w-lg'>
            <h2 className='text-md font-semibold text-gray-900'>Security Questionnaire</h2>
            <p className='text-sm text-gray-500'>
              Upload your security policies and questionnaires to automatically generate AI-powered
              answers using advanced document analysis.
            </p>
          </div>

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            knowledgeBaseCount={knowledgeBaseCount}
            questionsCount={questionsCount}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'knowledge-base' && <KnowledgeBase ref={knowledgeBaseRef} />}
      {activeTab === 'questions-answers' && <QuestionsAnswers />}
    </div>
  );
}
