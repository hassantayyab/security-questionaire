import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal rounded text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-violet-600 focus-visible:ring-violet-700 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 aria-invalid:border-red-500 cursor-pointer shadow-xs",
  {
    variants: {
      variant: {
        default: 'bg-violet-600 text-white hover:bg-violet-700',
        destructive: 'bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500/20',
        outline: 'border bg-white hover:bg-gray-100 hover:text-gray-900 border-gray-200',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-100/80',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        text: 'text-gray-500 hover:text-violet-600 hover:underline shadow-none underline-offset-2',
        link: 'text-violet-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded gap-1.5 px-3 has-[>svg]:px-2.5 text-xs font-normal',
        lg: 'h-10 rounded px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
