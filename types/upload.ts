/**
 * Upload-related type definitions for SoundDrop
 */

// File validation result
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// Upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Upload result
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  sample?: Record<string, unknown>; // Full sample data from API response
}

// File upload state
export interface FileUploadState {
  file: File;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: UploadProgress | null;
  error: string | null;
  result: UploadResult | null;
}

// Dropzone component props
export interface DropzoneProps {
  onDrop: (files: File[]) => void;
  accept: Record<string, string[]>;
  maxSize: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Audio file info
export interface AudioFileInfo {
  duration: number;
  size: number;
  type: string;
  name: string;
}

// Image file preview
export interface ImagePreview {
  file: File;
  url: string;
  name: string;
  size: number;
}

// Upload queue item
export interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  libraryId: string;
  status: 'queued' | 'uploading' | 'completed' | 'failed';
  progress: UploadProgress | null;
  error: string | null;
  startTime?: number;
  endTime?: number;
}

// Upload manager state
export interface UploadManagerState {
  queue: UploadQueueItem[];
  isUploading: boolean;
  concurrent: number;
  maxConcurrent: number;
}

// Rate limiting removed

// Upload configuration
export interface UploadConfig {
  maxFileSize: number;
  allowedTypes: readonly string[];
  maxConcurrent: number;
  chunkSize?: number;
  retryAttempts: number;
}

// File type constraints
export const AUDIO_ACCEPT = {
  'audio/*': ['.mp3', '.wav', '.ogg', '.mp4'],
} as const;

export const IMAGE_ACCEPT = {
  'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
} as const;

// Upload error types
export type UploadErrorType = 
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_NAME'
  | 'PERMISSION_DENIED'
  | 'STORAGE_FULL';

export interface UploadError {
  type: UploadErrorType;
  message: string;
  code?: string;
  retryable: boolean;
}

// Batch upload configuration
export interface BatchUploadConfig {
  maxFiles: number;
  allowDuplicateNames: boolean;
  namePrefix?: string;
  nameSuffix?: string;
  stopOnError: boolean;
}

// Upload analytics
export interface UploadAnalytics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalBytes: number;
  averageUploadTime: number;
  uploadsByType: Record<string, number>;
}

// File processing state
export interface FileProcessingState {
  isProcessing: boolean;
  stage: 'validating' | 'extracting-metadata' | 'generating-preview' | 'complete';
  progress: number;
  error: string | null;
}

// Drag and drop state
export interface DragDropState {
  isDragOver: boolean;
  isDragActive: boolean;
  draggedFiles: File[];
  isValidDrop: boolean;
}

// Upload form data
export interface UploadFormData {
  name: string;
  libraryId: string;
  file: File | null;
  iconFile?: File | null;
  description?: string;
}