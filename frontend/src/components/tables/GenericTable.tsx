'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => ReactNode;
}

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
}

interface GenericTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  selectedRows?: Set<string>;
  onRowSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  getRowId: (item: T) => string;
  itemsPerPage?: number;
  showCheckbox?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
}

const GenericTable = <T,>({
  data,
  columns,
  actions = [],
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  getRowId,
  itemsPerPage = 10,
  showCheckbox = true,
}: GenericTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleMenu = (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === itemId) {
      setOpenMenuId(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.right - 120,
    });
    setOpenMenuId(itemId);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-md overflow-hidden'>
      {/* Table Content */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          {/* Header */}
          <thead className='border-b border-gray-300'>
            <tr className='h-[44px]'>
              {showCheckbox && (
                <th className='px-4 text-left' style={{ width: columns[0].width }}>
                  <div className='flex items-center gap-5'>
                    <input
                      type='checkbox'
                      checked={allSelected}
                      onChange={(e) => onSelectAll?.(e.target.checked)}
                      className='w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors'
                    />
                    <span className='text-xs font-medium text-gray-900'>{columns[0].header}</span>
                  </div>
                </th>
              )}
              {(showCheckbox ? columns.slice(1) : columns).map((column) => (
                <th
                  key={column.key}
                  className={`px-4 text-${column.align || 'left'}`}
                  style={{ width: column.width }}
                >
                  <span className='text-xs font-medium text-gray-900'>{column.header}</span>
                </th>
              ))}
              {actions.length > 0 && <th className='px-4 text-right w-[62px]'></th>}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentData.map((item) => {
              const itemId = getRowId(item);
              return (
                <tr
                  key={itemId}
                  className='h-[70px] border-b border-gray-200 last:border-b-0 text-sm'
                >
                  {showCheckbox && (
                    <td className='px-4'>
                      <div className='flex items-center gap-5'>
                        <input
                          type='checkbox'
                          checked={selectedRows.has(itemId)}
                          onChange={() => onRowSelect?.(itemId)}
                          className='w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors'
                        />
                        <div className='flex-1'>{columns[0].render(item)}</div>
                      </div>
                    </td>
                  )}
                  {(showCheckbox ? columns.slice(1) : columns).map((column) => (
                    <td key={column.key} className={`px-4 text-${column.align || 'left'}`}>
                      {column.render(item)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className='px-4 w-[62px]'>
                      <div className='flex items-center justify-end'>
                        <button
                          ref={(el) => {
                            buttonRefs.current[itemId] = el;
                          }}
                          onClick={(e) => toggleMenu(itemId, e)}
                          className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
                        >
                          <MoreHorizontal className='w-4 h-4 text-gray-600' />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu */}
      {openMenuId && actions.length > 0 && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setOpenMenuId(null)} />
          <div
            className='fixed w-[120px] bg-white border border-gray-300 rounded-md shadow-lg z-20'
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <div className='py-1'>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const item = data.find((d) => getRowId(d) === openMenuId);
                    if (item) action.onClick(item);
                    setOpenMenuId(null);
                  }}
                  className='w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer'
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer / Pagination */}
      <div className='h-[50.5px] border-t border-gray-200 px-4 flex items-center gap-12'>
        <p className='text-xs text-gray-500'>Results per page: {itemsPerPage}</p>
        <p className='text-xs text-gray-500'>
          <span className='font-medium'>
            {startIndex + 1}-{endIndex}
          </span>
          {` of ${data.length}`}
        </p>
        <div className='flex items-center gap-6'>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center transition-opacity cursor-pointer ${
              currentPage === 1 ? 'opacity-30' : 'opacity-100 hover:opacity-70'
            }`}
          >
            <ChevronLeft className='w-5 h-5 text-gray-600' />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`w-5 h-5 flex items-center justify-center transition-opacity cursor-pointer ${
              currentPage >= totalPages ? 'opacity-30' : 'opacity-100 hover:opacity-70'
            }`}
          >
            <ChevronRight className='w-5 h-5 text-gray-600' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericTable;
