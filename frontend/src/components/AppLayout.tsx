'use client';

import { SidebarNavigation } from '@/components';
import { NavigationSection } from '@/types';
import { Activity, FolderOpen, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();

  // Define sidebar navigation structure
  const navigationSections: NavigationSection[] = [
    {
      heading: 'Security Questionnaire',
      items: [
        {
          id: 'knowledge-base',
          label: 'Knowledge base',
          icon: FolderOpen,
          href: '/knowledge-base',
        },
        {
          id: 'questionnaire',
          label: 'Questionnaires',
          icon: HelpCircle,
          href: '/questionnaire',
        },
      ],
    },
    {
      heading: 'System',
      items: [
        {
          id: 'debug',
          label: 'Diagnostics',
          icon: Activity,
          href: '/debug',
        },
      ],
    },
  ];

  // Determine active item based on current pathname
  const getActiveItemId = () => {
    if (pathname.startsWith('/knowledge-base')) return 'knowledge-base';
    if (pathname.startsWith('/questionnaire')) return 'questionnaire';
    if (pathname.startsWith('/debug')) return 'debug';
    return '';
  };

  const activeItemId = getActiveItemId();

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className='w-56 shrink-0'>
        <SidebarNavigation
          sections={navigationSections}
          activeItemId={activeItemId}
          onItemClick={() => {}}
        />
      </aside>

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>{children}</div>
    </>
  );
};

export default AppLayout;
