import { cn } from '@/lib/utils';
import { NavigationItem } from '@/types/navigation';
import Link from 'next/link';

type SidebarNavigationItemProps = {
  item: NavigationItem;
  isActive: boolean;
  onClick?: () => void;
};

export const SidebarNavigationItem = ({ item, isActive, onClick }: SidebarNavigationItemProps) => {
  const Icon = item.icon;

  const className = cn(
    'w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer',
    'hover:bg-black/[0.05]',
    isActive && 'bg-black/[0.08]',
  );

  const content = (
    <>
      <Icon className='size-4 shrink-0 text-neutral-600' />
      <span
        className={cn(
          'text-sm font-medium leading-5 truncate flex-1 text-left transition-colors',
          isActive ? 'text-neutral-900' : 'text-neutral-600',
        )}
      >
        {item.label}
      </span>
      {item.count !== undefined && item.count > 0 && (
        <span className='text-xs text-neutral-500 ml-auto'>{item.count}</span>
      )}
    </>
  );

  // If item has href, use Link component
  if (item.href) {
    return (
      <Link href={item.href} className={className} aria-current={isActive ? 'page' : undefined}>
        {content}
      </Link>
    );
  }

  // Otherwise use button with onClick
  return (
    <button onClick={onClick} className={className} aria-current={isActive ? 'page' : undefined}>
      {content}
    </button>
  );
};
