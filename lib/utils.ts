import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = process.env.ALLOWED_AUDIO_TYPES?.split(',') || []
  const maxSize = parseInt(process.env.MAX_AUDIO_SIZE_MB || '50') * 1024 * 1024
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' }
  }
  
  return { valid: true }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || []
  const maxSize = parseInt(process.env.MAX_ICON_SIZE_MB || '2') * 1024 * 1024
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image too large' }
  }
  
  return { valid: true }
}