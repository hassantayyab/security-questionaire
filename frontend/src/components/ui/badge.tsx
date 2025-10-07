import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-violet-600 focus-visible:ring-violet-600/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden border',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-violet-600 text-white [a&]:hover:bg-violet-600/90',
        secondary: 'border-transparent bg-gray-100 text-gray-900 [a&]:hover:bg-gray-100/90',
        destructive:
          'border-transparent bg-red-500 text-white [a&]:hover:bg-red-500/90 focus-visible:ring-red-500/20',
        outline: 'text-gray-900 [a&]:hover:bg-gray-100 [a&]:hover:text-gray-900',
        approved: 'bg-emerald-100 border-emerald-200 text-emerald-800',
        pending: 'bg-gray-100 border-transparent text-gray-600 border-gray-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
