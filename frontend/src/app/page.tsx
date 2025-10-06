'use client';

import {
  AnswersLibrary,
  KnowledgeBase,
  KnowledgeBaseTabs,
  QuestionsAnswers,
  SidebarNavigation,
} from '@/components';
import { NavigationSection } from '@/types';
import { FolderOpen, HelpCircle } from 'lucide-react';
import { useRef, useState } from 'react';

type TabType = 'knowledge-base' | 'questions-answers';
type KnowledgeBaseTabType = 'resources' | 'answers-library';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge-base');
  const [activeKnowledgeBaseTab, setActiveKnowledgeBaseTab] =
    useState<KnowledgeBaseTabType>('resources');
  const knowledgeBaseRef = useRef<any>(null);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [answersLibraryCount] = useState(5); // Placeholder count

  // Define sidebar navigation structure
  const navigationSections: NavigationSection[] = [
    {
      heading: 'Security Questionnaire',
      items: [
        {
          id: 'knowledge-base',
          label: 'Knowledge base',
          icon: FolderOpen,
          count: knowledgeBaseCount,
        },
        {
          id: 'questions-answers',
          label: 'Questionnaires',
          icon: HelpCircle,
          count: questionsCount,
        },
      ],
    },
  ];

  const handleNavigationClick = (itemId: string) => {
    setActiveTab(itemId as TabType);
  };

  const handleKnowledgeBaseTabChange = (tabId: string) => {
    setActiveKnowledgeBaseTab(tabId as KnowledgeBaseTabType);
  };

  // Define tabs for Knowledge Base section
  const knowledgeBaseTabs = [
    { id: 'resources', label: 'Resources', count: knowledgeBaseCount },
    { id: 'answers-library', label: 'Answers library', count: answersLibraryCount },
  ];

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar Navigation */}
      <aside className='w-64 shrink-0 bg-white'>
        <SidebarNavigation
          sections={navigationSections}
          activeItemId={activeTab}
          onItemClick={handleNavigationClick}
        />
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-auto'>
        <div className='flex flex-col h-full'>
          {activeTab === 'knowledge-base' && (
            <>
              {/* Header */}
              <div className='bg-white px-6 py-6'>
                <div className='flex flex-col gap-1'>
                  <h1 className='text-base font-semibold text-gray-900'>Knowledge base</h1>
                  <p className='text-xs text-gray-500 leading-4'>
                    Upload all your documents and past questionnaire responses so we can
                    automatically generate answers for future questionnaires.
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
                  <AnswersLibrary onCountChange={() => {}} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'questions-answers' && (
            <div className='p-6'>
              <QuestionsAnswers onCountChange={setQuestionsCount} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
