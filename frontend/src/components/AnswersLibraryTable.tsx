'use client';

import { GenericTable, TableAction, TableColumn } from '@/components/tables';
import { Answer } from '@/types';
import { ClipboardList, User } from 'lucide-react';

interface AnswersLibraryTableProps {
  data: Answer[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (answer: Answer) => void;
  onDelete: (answer: Answer) => void;
}

const AnswersLibraryTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onView,
  onDelete,
}: AnswersLibraryTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const columns: TableColumn<Answer>[] = [
    {
      key: 'question',
      header: 'Question',
      width: '38%',
      render: (answer) => (
        <span className='text-sm text-gray-900 leading-5 line-clamp-2'>{answer.question}</span>
      ),
    },
    {
      key: 'answer',
      header: 'Answer',
      width: '32%',
      render: (answer) => (
        <span className='text-sm text-gray-900 leading-5 line-clamp-2'>{answer.answer}</span>
      ),
    },
    {
      key: 'source_name' as keyof Answer,
      header: 'Source',
      width: '150px',
      render: (answer) => (
        <div className='flex items-center gap-1.5'>
          {answer.source_type === 'user' ? (
            <User className='w-3.5 h-3.5 text-gray-500' />
          ) : (
            <ClipboardList className='w-3.5 h-3.5 text-gray-500' />
          )}
          <span className='text-xs text-gray-900 truncate'>{answer.source_name}</span>
        </div>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last updated',
      width: '120px',
      render: (answer) => (
        <span className='text-xs text-gray-900 whitespace-nowrap'>
          {formatDate(answer.updated_at)}
        </span>
      ),
    },
  ];

  const actions: TableAction<Answer>[] = [
    {
      label: 'View',
      onClick: onView,
    },
    {
      label: 'Delete',
      onClick: onDelete,
    },
  ];

  return (
    <GenericTable
      data={data}
      columns={columns}
      actions={actions}
      selectedRows={selectedRows}
      onRowSelect={onRowSelect}
      onSelectAll={onSelectAll}
      getRowId={(answer) => answer.id}
      itemsPerPage={10}
      showCheckbox={true}
    />
  );
};

export default AnswersLibraryTable;
