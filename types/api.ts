/**
 * API response type definitions for SoundDrop
 */

import { 
  LibraryWithDetails, 
  SampleWithDetails, 
  FavoriteWithSample,
  PaginatedResponse 
} from './database';

// Base API response structure
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination response
export interface PaginatedApiResponse<T> extends ApiResponse {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Library API responses
export interface LibraryCreateRequest {
  name: string;
  description?: string;
  categoryId: string;
  iconUrl?: string;
}

export interface LibraryUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  iconUrl?: string;
  isPublic?: boolean;
}

export interface LibraryResponse extends ApiResponse {
  data: LibraryWithDetails;
}

export interface LibrariesResponse extends PaginatedApiResponse<LibraryWithDetails> {}

export interface LibraryDeleteResponse extends ApiResponse {
  message: string;
  deletedSamples: number;
}

// Sample API responses
export interface SampleResponse extends ApiResponse {
  data: SampleWithDetails;
}

export interface SamplesResponse extends PaginatedApiResponse<SampleWithDetails> {}

// Upload API responses
export interface AudioUploadRequest {
  file: File;
  name: string;
  libraryId: string;
}

export interface AudioUploadResponse extends ApiResponse {
  sample: SampleWithDetails;
  message: string;
}

export interface IconUploadRequest {
  file: File;
  libraryId?: string;
}

export interface IconUploadResponse extends ApiResponse {
  iconUrl: string;
  fileName: string;
  message: string;
}

export interface IconDeleteRequest {
  fileName: string;
}

export interface IconDeleteResponse extends ApiResponse {
  message: string;
}

// Rate limit API response
export interface RateLimitResponse extends ApiResponse {
  remaining: number;
  resetTime: number;
  maxUploads: number;
  windowMs: number;
}

// Favorites API responses
export interface FavoriteCreateRequest {
  sampleId: string;
}

export interface FavoriteResponse extends ApiResponse {
  data: FavoriteWithSample;
}

export interface FavoritesResponse extends PaginatedApiResponse<FavoriteWithSample> {}

// Search and filtering
export interface LibraryFilters {
  userId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SampleFilters {
  libraryId?: string;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'playCount' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Error response structure
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
  retryAfter?: number; // For rate limiting
}

// Upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  success: boolean;
}

// Batch upload types
export interface BatchUploadItem {
  file: File;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: UploadProgress;
  error?: string;
  sampleId?: string;
}

export interface BatchUploadState {
  items: BatchUploadItem[];
  isUploading: boolean;
  completed: number;
  failed: number;
  total: number;
}