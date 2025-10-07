'use client';

import { GenericTable, TableAction, TableColumn } from '@/components/tables';
import { Policy } from '@/types';
import { FileText } from 'lucide-react';

interface KnowledgeBaseTableProps {
  data: Policy[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
}

const KnowledgeBaseTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onView,
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
          <FileText className='w-5 h-5 text-gray-500' />
          <span className='text-sm font-medium text-gray-900 truncate'>{policy.name}</span>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '80px',
      render: (policy) =>
        policy.owner?.avatar ? (
          <img
            src={policy.owner.avatar}
            alt={policy.owner.name}
            className='w-6 h-6 rounded-full object-cover'
          />
        ) : (
          <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center'>
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
        <span className='text-gray-900 whitespace-nowrap'>{formatDate(policy.upload_date)}</span>
      ),
    },
    {
      key: 'use_in_questionnaire',
      header: 'Use in questionnaire',
      width: '180px',
      render: (policy) => (
        <span className='text-gray-900 whitespace-nowrap'>
          {policy.use_in_questionnaire ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  const actions: TableAction<Policy>[] = [
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
      getRowId={(policy) => policy.id}
      itemsPerPage={10}
      showCheckbox={true}
    />
  );
};

export default KnowledgeBaseTable;
