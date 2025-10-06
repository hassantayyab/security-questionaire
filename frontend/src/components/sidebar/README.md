# Sidebar Navigation

A flexible and reusable sidebar navigation component built following the Secfix Tailwind design system from Figma.

## Components

### `SidebarNavigation`

The main container component for the sidebar navigation.

**Props:**

- `sections: NavigationSection[]` - Array of navigation sections to display
- `activeItemId: string` - ID of the currently active navigation item
- `onItemClick: (itemId: string) => void` - Callback when a navigation item is clicked

### `SidebarNavigationSection`

A section within the sidebar with a heading and navigation items.

**Props:**

- `section: NavigationSection` - Section configuration with heading and items
- `activeItemId: string` - ID of the currently active item
- `onItemClick: (itemId: string) => void` - Callback for item clicks

### `SidebarNavigationItem`

Individual navigation item with icon and label.

**Props:**

- `item: NavigationItem` - Navigation item configuration
- `isActive: boolean` - Whether this item is currently active
- `onClick: () => void` - Click handler

## Types

### `NavigationItem`

```typescript
type NavigationItem = {
  id: string; // Unique identifier
  label: string; // Display label
  icon: LucideIcon; // Icon from lucide-react
  href?: string; // Optional link (for future routing)
  count?: number; // Optional badge count
};
```

### `NavigationSection`

```typescript
type NavigationSection = {
  heading: string; // Section heading
  items: NavigationItem[]; // Array of navigation items
};
```

## Usage Example

```tsx
import { SidebarNavigation } from '@/components';
import { NavigationSection } from '@/types';
import { FolderOpen, HelpCircle, Settings } from 'lucide-react';
import { useState } from 'react';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState('knowledge-base');

  const navigationSections: NavigationSection[] = [
    {
      heading: 'Security Questionnaire',
      items: [
        {
          id: 'knowledge-base',
          label: 'Knowledge base',
          icon: FolderOpen,
          count: 5,
        },
        {
          id: 'questionnaires',
          label: 'Questionnaires',
          icon: HelpCircle,
          count: 12,
        },
      ],
    },
    {
      heading: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className='flex h-screen'>
      <aside className='w-64 shrink-0'>
        <SidebarNavigation
          sections={navigationSections}
          activeItemId={activeTab}
          onItemClick={setActiveTab}
        />
      </aside>

      <main className='flex-1 overflow-auto'>{/* Your content here */}</main>
    </div>
  );
};
```

## Design Features

- **Responsive**: Adapts to container width (recommended: w-64)
- **Accessible**: Includes ARIA attributes for screen readers
- **Transitions**: Smooth color transitions on hover and active states
- **Icons**: Uses lucide-react for consistent iconography
- **Counts**: Optional badge counts for items
- **Multiple Sections**: Supports grouping items into sections with headings

## Styling

The component follows the Figma design system with:

- Background: `zinc-100`
- Border: Right border with `gray-200`
- Active state: `bg-black/[0.08]`
- Hover state: `bg-black/[0.05]`
- Text colors: Neutral color palette (500, 600, 900)
- Font: Inter with appropriate weights and sizes

## Future Enhancements

- Support for nested navigation items
- Integration with Next.js routing (using `href` prop)
- Collapsible sections
- Mobile-responsive drawer variant
- Drag-and-drop reordering
