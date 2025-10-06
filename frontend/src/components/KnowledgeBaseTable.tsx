'use client';

import { Policy } from '@/types';
import { ChevronLeft, ChevronRight, FileText, MoreHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

interface KnowledgeBaseTableProps {
  data: Policy[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
}

const KnowledgeBaseTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onView,
  onDelete,
}: KnowledgeBaseTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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

  const toggleMenu = (policyId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === policyId) {
      setOpenMenuId(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.right - 120, // 120px is the dropdown width
    });
    setOpenMenuId(policyId);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-md overflow-hidden'>
      {/* Table Content */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          {/* Header */}
          <thead className='border-b border-gray-300'>
            <tr className='h-[44px]'>
              <th className='px-4 text-left w-[376px]'>
                <div className='flex items-center gap-5'>
                  <input
                    type='checkbox'
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className='w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors'
                  />
                  <span className='text-xs font-medium text-gray-900'>Name</span>
                </div>
              </th>
              <th className='px-4 text-left w-[120px]'>
                <span className='text-xs font-medium text-gray-900'>Owner</span>
              </th>
              <th className='px-4 text-left w-[136px]'>
                <span className='text-xs font-medium text-gray-900'>Upload date</span>
              </th>
              <th className='px-4 text-left w-[170px]'>
                <span className='text-xs font-medium text-gray-900'>Use in questionnaire</span>
              </th>
              <th className='px-4 text-right w-[174px]'></th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentData.map((policy) => (
              <tr key={policy.id} className='h-[70px] border-b border-gray-200 last:border-b-0'>
                <td className='px-4'>
                  <div className='flex items-center gap-5'>
                    <input
                      type='checkbox'
                      checked={selectedRows.has(policy.id)}
                      onChange={() => onRowSelect(policy.id)}
                      className='w-4 h-4 border border-gray-300 rounded cursor-pointer transition-colors'
                    />
                    <div className='flex items-center gap-1.5'>
                      <FileText className='w-5 h-5 text-gray-500' />
                      <span className='text-sm font-medium text-gray-900 truncate'>
                        {policy.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className='px-4'>
                  {policy.owner?.avatar ? (
                    <img
                      src={policy.owner.avatar}
                      alt={policy.owner.name}
                      className='w-6 h-6 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center'>
                      <span className='text-xs font-medium text-gray-600'>
                        {policy.owner?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </td>
                <td className='px-4'>
                  <span className='text-xs text-[#323232]'>{formatDate(policy.upload_date)}</span>
                </td>
                <td className='px-4'>
                  <span className='text-xs text-[#323232]'>
                    {policy.use_in_questionnaire ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className='px-4'>
                  <div className='flex items-center justify-end'>
                    <button
                      ref={(el) => {
                        buttonRefs.current[policy.id] = el;
                      }}
                      onClick={(e) => toggleMenu(policy.id, e)}
                      className='w-[30px] h-[30px] border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer'
                    >
                      <MoreHorizontal className='w-4 h-4 text-gray-600' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Rendered outside table with fixed positioning */}
      {openMenuId && (
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
              <button
                onClick={() => {
                  const policy = data.find((p) => p.id === openMenuId);
                  if (policy) onView(policy);
                  setOpenMenuId(null);
                }}
                className='w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer'
              >
                View
              </button>
              <button
                onClick={() => {
                  const policy = data.find((p) => p.id === openMenuId);
                  if (policy) onDelete(policy);
                  setOpenMenuId(null);
                }}
                className='w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer'
              >
                Delete
              </button>
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

export default KnowledgeBaseTable;
