'use client';

import KnowledgeBaseTable from '@/components/KnowledgeBaseTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BannerActionButton, MultiSelectBanner } from '@/components/MultiSelectBanner';
import SearchField from '@/components/SearchField';
import { Button } from '@/components/ui/button';
import { UploadDialog } from '@/components/UploadDialog';
import { api, ApiError } from '@/lib/api';
import { Policy } from '@/types';
import { Plus } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'sonner';

export interface KnowledgeBaseRef {
  handleUploadSuccess: () => void;
}

interface KnowledgeBaseProps {
  onCountChange?: (count: number) => void;
}

const KnowledgeBase = forwardRef<KnowledgeBaseRef, KnowledgeBaseProps>(({ onCountChange }, ref) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load policies on component mount
  useEffect(() => {
    loadPolicies();
  }, []);

  // Notify parent component when policies count changes
  useEffect(() => {
    onCountChange?.(policies.length);
  }, [policies.length, onCountChange]);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPolicies();

      if (response.success && response.policies) {
        setPolicies(response.policies);
        console.log(`Loaded ${response.policies.length} policies from database`);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Failed to load policies');
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    // Reload policies from database to ensure consistency
    await loadPolicies();
  };

  useImperativeHandle(ref, () => ({
    handleUploadSuccess,
  }));

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(filteredPolicies.map((p) => p.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleDeletePolicy = async (policy: Policy) => {
    try {
      const response = await api.deletePolicy(policy.id);

      if (response.success) {
        toast.success(response.message);
        // Reload policies from database
        await loadPolicies();
      } else {
        toast.error('Failed to delete policy');
      }
    } catch (error) {
      console.error('Delete policy error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete policy. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedCount = selectedRows.size;

    try {
      const policyIds = Array.from(selectedRows);
      const response = await api.bulkDeletePolicies(policyIds);

      if (response.success) {
        // Reload policies from database
        await loadPolicies();
        // Clear selection
        setSelectedRows(new Set());
        toast.success(response.message);

        if (response.errors && response.errors.length > 0) {
          toast.warning(`Some resources could not be deleted`);
        }
      }
    } catch (error) {
      console.error('Error deleting policies:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete resources. Please try again.');
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  // Filter policies based on search term
  const filteredPolicies = policies.filter((policy) =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='space-y-4'>
      {/* Multi-Select Banner */}
      <MultiSelectBanner
        selectedCount={selectedRows.size}
        itemType='resource'
        onClose={handleClearSelection}
      >
        <BannerActionButton onClick={handleBulkDelete}>Delete</BannerActionButton>
      </MultiSelectBanner>

      {/* Search and Upload Section */}
      <div className='flex items-center justify-between w-full pt-4'>
        <div className='w-64'>
          <SearchField placeholder='Search' value={searchTerm} onChange={setSearchTerm} />
        </div>
        <UploadDialog
          onUploadSuccess={() => {
            handleUploadSuccess();
          }}
        >
          <Button variant='default' size='sm'>
            <Plus className='h-4 w-4' />
            Add resource
          </Button>
        </UploadDialog>
      </div>

      {/* Policies List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : policies.length === 0 ? (
        <div className='text-center py-8 space-y-3'>
          <div className='text-base font-medium text-gray-500'>No resources added</div>
          <div className='text-sm text-gray-500'>Upload your first document to get started</div>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className='text-center py-8 space-y-3'>
          <div className='text-base font-medium text-gray-500'>No documents match your search</div>
          <div className='text-sm text-gray-500'>
            Try adjusting your search term or clear the search to see all documents
          </div>
        </div>
      ) : (
        <KnowledgeBaseTable
          data={filteredPolicies}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onDelete={handleDeletePolicy}
        />
      )}
    </div>
  );
});

KnowledgeBase.displayName = 'KnowledgeBase';

export default KnowledgeBase;
