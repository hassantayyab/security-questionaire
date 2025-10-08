'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position='bottom-center'
      visibleToasts={1}
      className='toaster group'
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            '!bg-gray-800 !text-gray-200 border-0 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md pl-4 pr-3 py-4 flex items-start gap-3',
          icon: '!text-emerald-500',
          content: 'flex items-start flex-1',
          description: 'text-gray-100',
          title: 'text-gray-100 text-sm font-medium',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
