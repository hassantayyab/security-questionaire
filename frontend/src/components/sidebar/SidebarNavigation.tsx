'use client';

import { NavigationSection } from '@/types/navigation';
import { SidebarNavigationSection } from './SidebarNavigationSection';

type SidebarNavigationProps = {
  sections: NavigationSection[];
  activeItemId: string;
  onItemClick: (itemId: string) => void;
};

export const SidebarNavigation = ({
  sections,
  activeItemId,
  onItemClick,
}: SidebarNavigationProps) => {
  return (
    <div className='h-full w-full bg-zinc-100 border-r border-gray-200 flex flex-col gap-4 p-4 pt-3'>
      {sections.map((section, index) => (
        <SidebarNavigationSection
          key={index}
          section={section}
          activeItemId={activeItemId}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};
