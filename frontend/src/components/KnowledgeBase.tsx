'use client';

import FileUpload from '@/components/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appConfig } from '@/config/app';
import { api, ApiError } from '@/lib/api';
import { Policy, UploadResponse } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  FileText,
  Loader2,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [, setSelectedPolicy] = useState<Policy | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load policies on component mount
  useEffect(() => {
    loadPolicies();
  }, []);

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

  const handlePdfUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > appConfig.maxFileSize) {
      toast.error(`File size must be less than ${appConfig.maxFileSize / 1024 / 1024}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const response: UploadResponse = await api.uploadPdf(file);

      if (response.success) {
        toast.success(response.message);

        // Reload policies from database to ensure consistency
        await loadPolicies();
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload PDF. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

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

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900">$1</mark>');
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

  return (
    <div className='space-y-6'>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='w-5 h-5' />
            Upload Policy Documents
          </CardTitle>
          <CardDescription>
            Upload PDF files containing your security policies. Text will be automatically extracted
            using PyPDF2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept='.pdf'
            maxSize={appConfig.maxFileSize}
            onUpload={handlePdfUpload}
            isUploading={isUploading}
            allowedTypes={appConfig.allowedFileTypes.pdf}
          />
          {isUploading && (
            <div className='mt-4 space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Processing PDF with PyPDF2...
              </div>
              <Progress value={undefined} className='w-full' />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='w-5 h-5' />
            Uploaded Policies
            {policies.length > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {policies.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your uploaded policy documents and view extraction status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin mr-2' />
              Loading policies...
            </div>
          ) : policies.length === 0 ? (
            <div className='text-center py-8 space-y-3'>
              <FileText className='w-12 h-12 text-muted-foreground mx-auto' />
              <div className='text-lg font-medium text-muted-foreground'>
                No policies uploaded yet
              </div>
              <div className='text-sm text-muted-foreground'>
                Upload your first PDF policy document to get started
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          <FileText className='w-4 h-4 text-muted-foreground' />
                          {policy.name}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(policy.upload_date)}</TableCell>
                      <TableCell>{formatFileSize(policy.file_size)}</TableCell>
                      <TableCell>
                        {policy.extracted_text ? (
                          <Badge variant='default' className='gap-1'>
                            <CheckCircle className='w-3 h-3' />
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant='secondary' className='gap-1'>
                            <AlertCircle className='w-3 h-3' />
                            Processing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setViewingPolicy(policy);
                                  setSearchTerm('');
                                }}
                                disabled={!policy.extracted_text}
                                title={
                                  policy.extracted_text
                                    ? 'View extracted content'
                                    : 'Content not yet extracted'
                                }
                              >
                                <Eye className='w-4 h-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden flex flex-col'>
                              <DialogHeader>
                                <DialogTitle className='flex items-center gap-2'>
                                  <FileText className='w-5 h-5' />
                                  {viewingPolicy?.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Extracted content from PDF document (
                                  {viewingPolicy?.extracted_text?.length || 0} characters)
                                </DialogDescription>
                              </DialogHeader>

                              {/* Search and actions */}
                              <div className='flex items-center gap-2 py-2'>
                                <div className='relative flex-1'>
                                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
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
                                  onClick={() =>
                                    copyToClipboard(viewingPolicy?.extracted_text || '')
                                  }
                                  disabled={!viewingPolicy?.extracted_text}
                                >
                                  <Copy className='w-4 h-4 mr-2' />
                                  Copy All
                                </Button>
                              </div>

                              {/* Content display */}
                              <div className='flex-1 overflow-auto border rounded-lg p-4 bg-muted/50'>
                                {viewingPolicy?.extracted_text ? (
                                  <div className='whitespace-pre-wrap text-sm font-mono leading-relaxed'>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: highlightSearchTerm(
                                          getDisplayText(viewingPolicy),
                                          searchTerm,
                                        ),
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className='flex items-center justify-center h-32 text-muted-foreground'>
                                    <div className='text-center'>
                                      <FileText className='w-8 h-8 mx-auto mb-2 opacity-50' />
                                      <p>No content extracted yet</p>
                                      <p className='text-xs'>
                                        Content extraction may still be in progress
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Search results info */}
                              {searchTerm && viewingPolicy?.extracted_text && (
                                <div className='text-xs text-muted-foreground pt-2'>
                                  {(() => {
                                    const regex = new RegExp(
                                      searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                                      'gi',
                                    );
                                    const matches = [
                                      ...viewingPolicy.extracted_text.matchAll(regex),
                                    ];
                                    return matches.length > 0
                                      ? `Found ${matches.length} match${
                                          matches.length !== 1 ? 'es' : ''
                                        } ${matches.length > 10 ? '(showing first 10)' : ''}`
                                      : 'No matches found';
                                  })()}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-destructive hover:text-destructive'
                            onClick={() => handleDeletePolicy(policy)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policy Preview Modal would go here */}
      {/* This would be implemented with a Dialog component */}
    </div>
  );
}
