type TabType = 'knowledge-base' | 'questions-answers';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  knowledgeBaseCount: number;
  questionsCount: number;
}

const TabNavigation = ({
  activeTab,
  setActiveTab,
  knowledgeBaseCount,
  questionsCount,
}: TabNavigationProps) => {
  return (
    <div className='flex items-center gap-8 border-b border-gray-200'>
      <button
        onClick={() => setActiveTab('knowledge-base')}
        className={`pb-3 border-b-2 transition-all duration-200 text-sm cursor-pointer ${
          activeTab === 'knowledge-base'
            ? 'border-violet-600 text-violet-600'
            : 'border-transparent text-gray-500 hover:border-gray-200'
        }`}
      >
        <span className='flex items-center gap-2'>
          <span>
            Knowledge Base{' '}
            <span
              className={`${activeTab === 'knowledge-base' ? 'text-violet-600' : 'text-gray-500'}`}
            >
              ({knowledgeBaseCount})
            </span>
          </span>
        </span>
      </button>
      <button
        onClick={() => setActiveTab('questions-answers')}
        className={`pb-3 border-b-2 transition-all duration-200 text-sm cursor-pointer ${
          activeTab === 'questions-answers'
            ? 'border-violet-600 text-violet-600'
            : 'border-transparent text-gray-500 hover:border-gray-200'
        }`}
      >
        <span className='flex items-center gap-2'>
          <span>
            Question & Answers{' '}
            <span
              className={`${
                activeTab === 'questions-answers' ? 'text-violet-600' : 'text-gray-500'
              }`}
            >
              ({questionsCount})
            </span>
          </span>
        </span>
      </button>
    </div>
  );
};

export default TabNavigation;
