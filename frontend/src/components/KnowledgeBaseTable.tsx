'use client';

import { GenericTable, TableColumn } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { Policy } from '@/types';
import { FileText, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface KnowledgeBaseTableProps {
  data: Policy[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onDelete: (policy: Policy) => void;
}

const KnowledgeBaseTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onDelete,
}: KnowledgeBaseTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns: TableColumn<Policy>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (policy) => (
        <div className='flex items-center gap-1.5'>
          <FileText className='h-5 w-5 text-gray-500' />
          <span className='truncate text-sm font-medium text-gray-900'>{policy.name}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '80px',
      render: (policy) =>
        policy.owner?.avatar ? (
          <Image
            src={policy.owner.avatar}
            alt={policy.owner.name}
            width={24}
            height={24}
            className='h-6 w-6 rounded-full object-cover'
          />
        ) : (
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-200'>
            <span className='font-medium text-gray-600'>
              {policy.owner?.name?.charAt(0) || '?'}
            </span>
          </div>
        ),
    },
    {
      key: 'upload_date',
      header: 'Upload date',
      width: '120px',
      render: (policy) => (
        <span className='whitespace-nowrap text-gray-900'>{formatDate(policy.upload_date)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (policy) => (
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='icon'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(policy);
            }}
            className='h-[30px] w-[30px]'
            aria-label='Delete resource'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <GenericTable
      data={data}
      columns={columns}
      selectedRows={selectedRows}
      onRowSelect={onRowSelect}
      onSelectAll={onSelectAll}
      getRowId={(policy) => policy.id}
      itemsPerPage={10}
      showCheckbox={true}
    />
  );
};

export default KnowledgeBaseTable;
