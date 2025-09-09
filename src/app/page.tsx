'use client'

import { useState } from 'react'
import { KnowledgeBase } from '@/components/KnowledgeBase'
import { QuestionsAnswers } from '@/components/QuestionsAnswers'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'questions'>('knowledge')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'knowledge'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Questions & Answers
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'questions' && <QuestionsAnswers />}
      </div>
    </div>
  )
}
