'use client';

import { useState, useCallback, useEffect } from 'react';
import { UploadProgress, UploadResult, FileUploadState } from '@/types/upload';
import { uploadAudioFile, uploadIconFile } from '@/lib/upload-utils';
import { SampleWithDetails } from '@/types/database';

export interface UseUploadResult {
  // Upload state
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  success: boolean;
  
  // Actions
  uploadAudio: (file: File, name: string, libraryId: string) => Promise<SampleWithDetails | null>;
  uploadIcon: (file: File, libraryId?: string) => Promise<string | null>;
  clearError: () => void;
  resetUploadState: () => void;
}

export function useUpload(): UseUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadAudio = useCallback(async (
    file: File, 
    name: string, 
    libraryId: string
  ): Promise<SampleWithDetails | null> => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);
      setProgress(null);

      const result = await uploadAudioFile(file, name, libraryId, (progressInfo) => {
        setProgress(progressInfo);
      });

      if (result.success) {
        setSuccess(true);
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        
        // Return the uploaded sample data
        return (result.sample as SampleWithDetails) || null;
      } else {
        setError(result.error || 'Upload failed');
        return null;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadIcon = useCallback(async (
    file: File, 
    libraryId?: string
  ): Promise<string | null> => {
    try {
      setError(null);

      const result = await uploadIconFile(file, libraryId);

      if (result.success && result.url) {
        return result.url;
      } else {
        setError(result.error || 'Icon upload failed');
        return null;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Icon upload failed';
      setError(errorMessage);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isUploading,
    progress,
    error,
    success,
    uploadAudio,
    uploadIcon,
    clearError,
    resetUploadState,
  };
}

// Hook for batch uploads
export interface UseBatchUploadResult {
  files: FileUploadState[];
  isUploading: boolean;
  completed: number;
  failed: number;
  total: number;
  
  addFiles: (files: File[], libraryId: string) => void;
  removeFile: (index: number) => void;
  startUpload: () => Promise<void>;
  clearFiles: () => void;
  updateFileName: (index: number, name: string) => void;
}

export function useBatchUpload(libraryId?: string): UseBatchUploadResult {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[], libraryId: string) => {
    const fileStates: FileUploadState[] = newFiles.map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      status: 'pending',
      progress: null,
      error: null,
      result: null,
    }));
    
    setFiles(prev => [...prev, ...fileStates]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFileName = useCallback((index: number, name: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, name } : file
    ));
  }, []);

  const startUpload = useCallback(async () => {
    if (isUploading || files.length === 0 || !libraryId) return;

    setIsUploading(true);

    // Upload files sequentially to respect rate limits
    for (let i = 0; i < files.length; i++) {
      const fileState = files[i];
      
      if (fileState.status === 'success') continue;

      // Update status to uploading
      setFiles(prev => prev.map((file, index) => 
        index === i ? { ...file, status: 'uploading' as const, error: null } : file
      ));

      try {
        // Use the real upload function
        const result = await uploadAudioFile(
          fileState.file,
          fileState.name,
          libraryId,
          (progressInfo) => {
            setFiles(prev => prev.map((file, index) => 
              index === i ? { ...file, progress: progressInfo } : file
            ));
          }
        );

        if (result.success) {
          setFiles(prev => prev.map((file, index) => 
            index === i ? { 
              ...file, 
              status: 'success' as const, 
              progress: { loaded: file.file.size, total: file.file.size, percentage: 100 },
              result 
            } : file
          ));
        } else {
          setFiles(prev => prev.map((file, index) => 
            index === i ? { 
              ...file, 
              status: 'error' as const, 
              error: result.error || 'Upload failed',
              result 
            } : file
          ));
        }

        // Small delay between uploads to be nice to the server
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        setFiles(prev => prev.map((file, index) => 
          index === i ? { 
            ...file, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : file
        ));
      }
    }

    setIsUploading(false);
  }, [isUploading, files, libraryId]);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const completed = files.filter(f => f.status === 'success').length;
  const failed = files.filter(f => f.status === 'error').length;
  const total = files.length;

  return {
    files,
    isUploading,
    completed,
    failed,
    total,
    addFiles,
    removeFile,
    startUpload,
    clearFiles,
    updateFileName,
  };
}