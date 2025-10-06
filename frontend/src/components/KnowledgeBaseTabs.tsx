'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface KnowledgeBaseTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const KnowledgeBaseTabs = ({ tabs, activeTab, onTabChange }: KnowledgeBaseTabsProps) => {
  return (
    <div className='relative h-[38px] w-full'>
      {/* Bottom border line */}
      <div className='absolute bottom-px left-0 right-0 h-px bg-gray-200' />

      {/* Tabs */}
      <div className='flex gap-8 items-center'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className='relative flex flex-col items-center justify-center cursor-pointer transition-colors group'
            >
              <div className='px-1 pb-4 flex items-center justify-center'>
                <p
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-violet-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && ` (${tab.count})`}
                </p>
              </div>
              {isActive ? (
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500' />
              ) : (
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity' />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeBaseTabs;
