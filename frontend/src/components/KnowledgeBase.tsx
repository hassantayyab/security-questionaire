'use client';

import KnowledgeBaseTable from '@/components/KnowledgeBaseTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BannerActionButton, MultiSelectBanner } from '@/components/MultiSelectBanner';
import SearchField from '@/components/SearchField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UploadDialog } from '@/components/UploadDialog';
import { api, ApiError } from '@/lib/api';
import { Policy } from '@/types';
import { Copy, FileText, Plus, Search } from 'lucide-react';
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
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    if (
      !confirm(`Are you sure you want to delete "${policy.name}"? This action cannot be undone.`)
    ) {
      return;
    }

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

    if (!confirm(`Are you sure you want to delete ${selectedCount} resource${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

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

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(
      regex,
      '<mark class="bg-violet-600/20 dark:bg-violet-600/30 text-violet-600 dark:text-violet-600">$1</mark>',
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Content copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy content');
    }
  };

  const getDisplayText = (policy: Policy) => {
    if (!policy.extracted_text) return 'No content extracted';

    const text = policy.extracted_text;
    if (!searchTerm.trim()) return text;

    // If searching, show context around matches
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = [...text.matchAll(regex)];

    if (matches.length === 0) return text;

    // Show snippets around each match with context
    const snippets = matches.slice(0, 10).map((match) => {
      const start = Math.max(0, match.index! - 150);
      const end = Math.min(text.length, match.index! + match[0].length + 150);
      const snippet = text.substring(start, end);
      const prefix = start > 0 ? '...' : '';
      const suffix = end < text.length ? '...' : '';
      return prefix + snippet + suffix;
    });

    return snippets.join('\n\n---\n\n');
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
          <button className='bg-violet-600 border border-violet-600 text-white px-3 py-[7px] rounded text-xs font-medium hover:bg-violet-700 transition-colors flex items-center gap-1.5 cursor-pointer'>
            <Plus className='h-4 w-4' />
            Add resource
          </button>
        </UploadDialog>
      </div>

      {/* Policies List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : policies.length === 0 ? (
        <div className='text-center py-8 space-y-3'>
          <FileText className='w-12 h-12 text-gray-500 mx-auto' />
          <div className='text-base font-medium text-gray-500'>No documents uploaded</div>
          <div className='text-sm text-gray-500'>Upload your first PDF document to get started</div>
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
          onView={(policy) => {
            setViewingPolicy(policy);
            setSearchTerm('');
          }}
          onDelete={handleDeletePolicy}
        />
      )}

      {/* Policy Preview Modal */}
      {viewingPolicy && (
        <Dialog open={!!viewingPolicy} onOpenChange={() => setViewingPolicy(null)}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden flex flex-col'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                {viewingPolicy?.name}
              </DialogTitle>
              <DialogDescription>
                Extracted content from PDF document ({viewingPolicy?.extracted_text?.length || 0}{' '}
                characters)
              </DialogDescription>
            </DialogHeader>

            {/* Search and actions */}
            <div className='flex items-center gap-2 py-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4' />
                <Input
                  placeholder='Search in content...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => copyToClipboard(viewingPolicy?.extracted_text || '')}
                disabled={!viewingPolicy?.extracted_text}
                className='border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white focus:ring-violet-600/20 transition-colors'
              >
                <Copy className='w-4 h-4 mr-2' />
                Copy All
              </Button>
            </div>

            {/* Content display */}
            <div className='flex-1 overflow-auto border rounded-md p-4 bg-gray-100'>
              {viewingPolicy?.extracted_text ? (
                <div className='whitespace-pre-wrap text-sm font-mono leading-relaxed'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(getDisplayText(viewingPolicy), searchTerm),
                    }}
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center h-32 text-gray-500'>
                  <div className='text-center'>
                    <FileText className='w-8 h-8 mx-auto mb-2 opacity-50' />
                    <p>No content extracted yet</p>
                    <p className='text-xs'>Content extraction may still be in progress</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search results info */}
            {searchTerm && viewingPolicy?.extracted_text && (
              <div className='text-xs text-gray-500 pt-2'>
                {(() => {
                  const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                  const matches = [...viewingPolicy.extracted_text.matchAll(regex)];
                  return matches.length > 0
                    ? `Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} ${
                        matches.length > 10 ? '(showing first 10)' : ''
                      }`
                    : 'No matches found';
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

KnowledgeBase.displayName = 'KnowledgeBase';

export default KnowledgeBase;
