'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface StandardDialogProps {
  // Dialog control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;

  // Header
  title: string;
  description?: string;

  // Content
  children: ReactNode;

  // Footer
  cancelLabel?: string;
  actionLabel?: string;
  onCancel?: () => void;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  hideFooter?: boolean;

  // Styling
  maxWidth?: string;
  showCloseButton?: boolean;
}

export const StandardDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  cancelLabel = 'Cancel',
  actionLabel = 'Save',
  onCancel,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  hideFooter = false,
  maxWidth = 'max-w-[532px]',
  showCloseButton = true,
}: StandardDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={`p-0 ${maxWidth} gap-0`} showCloseButton={false}>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-5 py-3'>
          <DialogTitle className='text-sm font-medium text-gray-900'>{title}</DialogTitle>
          {showCloseButton && (
            <DialogClose>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 rounded border border-transparent text-gray-500 transition-colors focus-visible:ring-violet-600 focus-visible:ring-offset-2 hover:bg-gray-100 shadow-none'
                aria-label='Close dialog'
              >
                <X className='h-6 w-6' />
              </Button>
            </DialogClose>
          )}
        </div>

        {/* Hidden description for accessibility */}
        {description && <DialogDescription className='sr-only'>{description}</DialogDescription>}

        {/* Content */}
        <div className='px-5 py-5'>{children}</div>

        {/* Footer */}
        {!hideFooter && (
          <div className='flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4'>
            <Button
              variant='outline'
              className='h-9 border-gray-300 px-4 text-sm text-gray-700'
              onClick={onCancel}
              disabled={actionLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              className={`h-9 px-4 text-sm font-medium ${
                actionDisabled || actionLoading
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  : 'bg-violet-600 text-white hover:bg-violet-700 border border-violet-600'
              }`}
              disabled={actionDisabled || actionLoading}
              onClick={onAction}
            >
              {actionLoading ? 'Loading...' : actionLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
