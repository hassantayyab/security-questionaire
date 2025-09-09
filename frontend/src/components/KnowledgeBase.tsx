'use client';

import FileUpload from '@/components/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertCircle, CheckCircle, Eye, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [, setSelectedPolicy] = useState<Policy | null>(null);

  // Load policies on component mount
  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      // Note: We need to implement this endpoint in the backend
      // For now, we'll use empty array
      setPolicies([]);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Failed to load policies');
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

        // Add the new policy to the list
        const newPolicy: Policy = {
          id: response.policy_id || '',
          name: response.filename,
          filename: response.filename,
          file_size: response.file_size,
          extracted_text: response.text_preview,
          upload_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setPolicies((prev) => [newPolicy, ...prev]);
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
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-destructive hover:text-destructive'
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
