/**
 * Upload utility functions for SoundDrop
 */

import { ALLOWED_AUDIO_TYPES, ALLOWED_IMAGE_TYPES, MAX_AUDIO_SIZE_MB, MAX_ICON_SIZE_MB } from './constants';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  sample?: Record<string, unknown>; // Full sample data from API response
}

/**
 * Upload audio file with progress tracking
 */
export async function uploadAudioFile(
  file: File,
  name: string,
  libraryId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file before upload
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('libraryId', libraryId);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
            onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 201) {
            resolve({
              success: true,
              url: response.sample?.fileUrl,
              fileName: response.sample?.name,
              sample: response.sample, // Include full sample data
            });
          } else {
            resolve({
              success: false,
              error: response.error || `Upload failed (${xhr.status})`,
            });
          }
        } catch (parseError) {
          console.error('Failed to parse upload response:', parseError, xhr.responseText);
          resolve({
            success: false,
            error: 'Failed to parse response',
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error during upload',
        });
      });

      xhr.addEventListener('abort', () => {
        resolve({
          success: false,
          error: 'Upload cancelled',
        });
      });

      xhr.open('POST', '/api/upload/audio');
      xhr.send(formData);
    });

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload icon file
 */
export async function uploadIconFile(
  file: File,
  libraryId?: string
): Promise<UploadResult> {
  try {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    if (libraryId) {
      formData.append('libraryId', libraryId);
    }

    const response = await fetch('/api/upload/icon', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        url: result.iconUrl,
        fileName: result.fileName,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Upload failed',
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type as typeof ALLOWED_AUDIO_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_AUDIO_TYPES.join(', ')}`,
    };
  }

  const maxSizeBytes = MAX_AUDIO_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_AUDIO_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  const maxSizeBytes = MAX_ICON_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_ICON_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Delete icon file
 */
export async function deleteIconFile(fileName: string): Promise<UploadResult> {
  try {
    const response = await fetch('/api/upload/icon', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Delete failed',
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get upload rate limit status
 */
export async function getUploadRateLimit(): Promise<{
  remaining: number;
  resetTime: number;
  maxUploads: number;
  windowMs: number;
} | null> {
  try {
    const response = await fetch('/api/upload/audio');
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get rate limit info:', error);
    return null;
  }
}

/**
 * Format remaining time until rate limit reset
 */
export function formatRateLimitReset(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;
  
  if (diff <= 0) {
    return 'Now';
  }
  
  const minutes = Math.ceil(diff / (1000 * 60));
  
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

/**
 * Check if file drop is valid
 */
export function isValidFileDrop(
  event: DragEvent,
  acceptedTypes: readonly string[]
): boolean {
  if (!event.dataTransfer?.files) return false;
  
  const files = Array.from(event.dataTransfer.files);
  return files.every(file => acceptedTypes.includes(file.type));
}

/**
 * Create file preview for images
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}