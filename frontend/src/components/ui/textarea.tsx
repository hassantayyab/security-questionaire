import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'border-gray-300 placeholder:text-gray-500 focus-visible:border-violet-600 focus-visible:ring-violet-600/50 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 flex field-sizing-content min-h-16 w-full rounded border bg-transparent px-3 py-2 text-base shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
