import { NavigationSection } from '@/types/navigation';
import { SidebarNavigationItem } from './SidebarNavigationItem';

type SidebarNavigationSectionProps = {
  section: NavigationSection;
  activeItemId: string;
  onItemClick: (itemId: string) => void;
};

export const SidebarNavigationSection = ({
  section,
  activeItemId,
  onItemClick,
}: SidebarNavigationSectionProps) => {
  return (
    <div className='flex flex-col w-full'>
      {/* Section Heading */}
      <div className='px-2 py-2 pb-1.5'>
        <p className='text-xs font-medium leading-4 text-neutral-500'>{section.heading}</p>
      </div>

      {/* Navigation Items */}
      <div className='flex flex-col gap-0.5'>
        {section.items.map((item) => (
          <SidebarNavigationItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </div>
  );
};
