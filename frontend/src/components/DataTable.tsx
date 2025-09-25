'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

// Helper component to safely render icons
const SafeIcon = ({ icon, className }: { icon: LucideIcon; className?: string }) => {
  const IconComponent = icon;
  return <IconComponent className={className} />;
};

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  maxWidth?: string;
  render?: (item: T, value: any) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableAction<T = any> {
  label: string;
  icon: LucideIcon;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  title?: (item: T) => string;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[] | ((item: T) => DataTableAction<T>[]);
  // Checkbox selection props
  showCheckboxes?: boolean;
  selectedRows?: Set<string>;
  onRowSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  getRowId: (item: T) => string;
  // Table styling
  className?: string;
  emptyState?: ReactNode;
  // Row styling
  getRowClassName?: (item: T) => string;
  // Loading state
  isLoading?: boolean;
}

export default function DataTable<T = any>({
  data,
  columns,
  actions,
  showCheckboxes = false,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  getRowId,
  className = '',
  emptyState,
  getRowClassName,
  isLoading = false,
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  };

  const handleRowSelect = (id: string) => {
    if (onRowSelect) {
      onRowSelect(id);
    }
  };

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  // Check if we have actions (either static or dynamic)
  const hasActions = actions && (Array.isArray(actions) ? actions.length > 0 : true);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <TooltipProvider delayDuration={500}>
      <div className={`overflow-x-auto border rounded-md ${className}`}>
        <Table className='min-w-full'>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className='w-8'>
                  <input
                    type='checkbox'
                    className='rounded-md'
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.className}
                  style={{
                    width: column.width,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.header}
                </TableHead>
              ))}
              {hasActions && <TableHead className='text-right'>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const rowId = getRowId(item);
              const isSelected = selectedRows.has(rowId);

              return (
                <TableRow key={rowId} className={getRowClassName ? getRowClassName(item) : ''}>
                  {showCheckboxes && (
                    <TableCell>
                      <input
                        type='checkbox'
                        className='rounded-md'
                        checked={isSelected}
                        onChange={() => handleRowSelect(rowId)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = item[column.key as keyof T];

                    return (
                      <TableCell
                        key={`${rowId}-${column.key}`}
                        className={column.className}
                        style={{
                          width: column.width,
                          maxWidth: column.maxWidth,
                        }}
                      >
                        {column.render ? column.render(item, value) : String(value || '')}
                      </TableCell>
                    );
                  })}
                  {hasActions && (
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        {(() => {
                          const actionsForRow = Array.isArray(actions)
                            ? actions
                            : actions
                            ? actions(item)
                            : [];
                          return actionsForRow.map((action, index) => {
                            const isDisabled = action.disabled ? action.disabled(item) : false;
                            const title = action.title ? action.title(item) : action.label;

                            return (
                              <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={action.variant || 'outline'}
                                    size='sm'
                                    onClick={() => action.onClick(item)}
                                    disabled={isDisabled}
                                    title={title}
                                    className={action.className}
                                  >
                                    <SafeIcon icon={action.icon} className='w-4 h-4' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{title}</TooltipContent>
                              </Tooltip>
                            );
                          });
                        })()}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

// Helper function to create a truncated text cell with tooltip
export const createTextCell = (maxLines: number = 2, showTooltip: boolean = true) => {
  return (item: any, value: string) => {
    if (!value) return <span className='text-gray-500 italic'>No content</span>;

    const cellContent = (
      <div
        className={`text-sm pr-4 leading-relaxed whitespace-normal break-words ${
          maxLines === 1 ? 'line-clamp-1' : maxLines === 2 ? 'line-clamp-2' : 'line-clamp-3'
        }`}
      >
        {value}
      </div>
    );

    if (!showTooltip) return cellContent;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='cursor-help'>{cellContent}</div>
        </TooltipTrigger>
        <TooltipContent className='max-w-sm p-3 text-sm whitespace-normal break-words' side='top'>
          {value}
        </TooltipContent>
      </Tooltip>
    );
  };
};

// Helper function to create a badge cell
export const createBadgeCell = (
  getBadgeProps: (
    item: any,
    value: any,
  ) => {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
    children: ReactNode;
  },
) => {
  return (item: any, value: any) => {
    const { variant = 'default', className = '', children } = getBadgeProps(item, value);

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          variant === 'default'
            ? 'bg-primary text-primary-foreground'
            : variant === 'secondary'
            ? 'bg-secondary text-secondary-foreground'
            : variant === 'destructive'
            ? 'bg-destructive text-destructive-foreground'
            : 'border bg-background text-foreground'
        } ${className}`}
      >
        {children}
      </span>
    );
  };
};
