'use client';

import { GenericTable, TableAction, TableColumn } from '@/components/tables';
import { Questionnaire } from '@/types';
import { CheckCircle } from 'lucide-react';

interface QuestionnairesTableProps {
  data: Questionnaire[];
  selectedRows: Set<string>;
  onRowSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (questionnaire: Questionnaire) => void;
  onDelete: (questionnaire: Questionnaire) => void;
}

const QuestionnairesTable = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onView,
  onDelete,
}: QuestionnairesTableProps) => {
  // Format date as DD.MM.YYYY following Figma design
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const columns: TableColumn<Questionnaire>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '336px',
      render: (questionnaire) => (
        <div
          className='text-sm text-gray-900 leading-5 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors'
          onClick={() => onView(questionnaire)}
        >
          {questionnaire.name}
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '100px',
      render: (questionnaire) => {
        // For now, display a placeholder avatar
        // In the future, this will use real user data
        return (
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center'>
              <span className='text-xs font-medium text-violet-600'>
                {questionnaire.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'approved_count',
      header: 'Approved answers',
      width: '120px',
      render: (questionnaire) => {
        const approved = questionnaire.approved_count || 0;
        const total = questionnaire.question_count || 0;
        const isComplete = total > 0 && approved === total;

        return (
          <div className='flex items-center gap-2'>
            <CheckCircle className={`w-4 h-4 ${isComplete ? 'text-green-500' : 'text-gray-400'}`} />
            <span className='text-xs text-gray-900'>
              {approved}/{total}
            </span>
          </div>
        );
      },
    },
    {
      key: 'approved_date',
      header: 'Approved date',
      width: '120px',
      render: (questionnaire) => (
        <span className='text-sm text-gray-900 whitespace-nowrap'>
          {formatDate(questionnaire.approved_date)}
        </span>
      ),
    },
    {
      key: 'upload_date',
      header: 'Upload date',
      width: '120px',
      render: (questionnaire) => (
        <span className='text-sm text-gray-900 whitespace-nowrap'>
          {formatDate(questionnaire.upload_date)}
        </span>
      ),
    },
  ];

  const actions: TableAction<Questionnaire>[] = [
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
      getRowId={(questionnaire) => questionnaire.id}
      itemsPerPage={10}
      showCheckbox={true}
    />
  );
};

export default QuestionnairesTable;
