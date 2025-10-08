import { LucideIcon } from 'lucide-react';

export type NavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  count?: number;
};

export type NavigationSection = {
  heading: string;
  items: NavigationItem[];
};
