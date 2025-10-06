'use client';

import { AnswersLibrary, AppLayout, KnowledgeBase, KnowledgeBaseTabs } from '@/components';
import { useRef, useState } from 'react';

type KnowledgeBaseTabType = 'resources' | 'answers-library';

export default function KnowledgeBasePage() {
  const [activeKnowledgeBaseTab, setActiveKnowledgeBaseTab] =
    useState<KnowledgeBaseTabType>('resources');
  const knowledgeBaseRef = useRef<any>(null);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [answersLibraryCount, setAnswersLibraryCount] = useState(0);

  const handleKnowledgeBaseTabChange = (tabId: string) => {
    setActiveKnowledgeBaseTab(tabId as KnowledgeBaseTabType);
  };

  // Define tabs for Knowledge Base section
  const knowledgeBaseTabs = [
    { id: 'resources', label: 'Resources', count: knowledgeBaseCount },
    { id: 'answers-library', label: 'Answers library', count: answersLibraryCount },
  ];

  return (
    <AppLayout>
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='bg-white px-6 py-6'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-base font-semibold text-gray-900'>Knowledge base</h1>
            <p className='text-xs text-gray-500 leading-4'>
              Upload all your documents and past questionnaire responses so we can automatically
              generate answers for future questionnaires.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white px-6'>
          <KnowledgeBaseTabs
            tabs={knowledgeBaseTabs}
            activeTab={activeKnowledgeBaseTab}
            onTabChange={handleKnowledgeBaseTabChange}
          />
        </div>

        {/* Content */}
        <div className='flex-1 bg-white px-6 pb-6'>
          <div className={activeKnowledgeBaseTab === 'resources' ? 'block' : 'hidden'}>
            <KnowledgeBase ref={knowledgeBaseRef} onCountChange={setKnowledgeBaseCount} />
          </div>
          <div className={activeKnowledgeBaseTab === 'answers-library' ? 'block' : 'hidden'}>
            <AnswersLibrary onCountChange={setAnswersLibraryCount} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
