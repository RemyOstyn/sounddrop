/**
 * Audio utility functions for SoundDrop
 */

/**
 * Extract duration from an audio file using Web Audio API
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration || 0);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio file'));
    });

    audio.src = url;
  });
}

/**
 * Validate audio file client-side
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'audio/mp4',
    'audio/ogg',
  ];

  const maxSizeMB = parseInt(process.env.NEXT_PUBLIC_MAX_AUDIO_SIZE_MB || '50');
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format audio duration for display
 */
export function formatAudioDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get audio file info (duration, size, etc.)
 */
export async function getAudioFileInfo(file: File): Promise<{
  duration: number;
  size: number;
  type: string;
  name: string;
}> {
  const duration = await getAudioDuration(file);

  return {
    duration,
    size: file.size,
    type: file.type,
    name: file.name,
  };
}

/**
 * Create audio preview URL that can be played
 */
export function createAudioPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up audio preview URL
 */
export function revokeAudioPreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Check if file is an audio file
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract file name without extension
 */
export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}

/**
 * Generate suggested sample name from file name
 */
export function generateSampleNameFromFile(fileName: string): string {
  // Remove extension and clean up the name
  let name = getFileNameWithoutExtension(fileName);
  
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ');
  
  // Capitalize first letter of each word
  name = name.replace(/\b\w/g, l => l.toUpperCase());
  
  // Limit length
  if (name.length > 50) {
    name = name.substring(0, 47) + '...';
  }
  
  return name;
}