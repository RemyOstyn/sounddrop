import { User } from '@supabase/supabase-js'

// Extend Supabase User type with our custom fields
export type AuthUser = User & {
  user_metadata: {
    name?: string
    avatar_url?: string
    full_name?: string
    picture?: string
  }
}

// Auth session types
export type AuthSession = {
  user: AuthUser | null
  isLoading: boolean
  error: Error | null
}

// Storage types
export type SupabaseFile = {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    eTag: string
    size: number
    mimetype: string
    cacheControl: string
    lastModified: string
    contentLength: number
    httpStatusCode: number
  }
}

export type FileUploadResult = {
  path: string
  fullPath: string
  publicUrl: string
}

export type AudioFileUpload = {
  file: File
  path: string
  metadata: {
    duration: number
    size: number
    mimeType: string
  }
}

export type ImageFileUpload = {
  file: File
  path: string
  metadata: {
    size: number
    mimeType: string
    width?: number
    height?: number
  }
}

// Auth action types
export type AuthProvider = 'google'

export type SignInResult = {
  data: {
    user: AuthUser | null
    session: unknown | null
    url?: string | null
  }
  error: Error | null
}

export type SignOutResult = {
  error: Error | null
}

// RLS (Row Level Security) types
export type RLSPolicy = {
  name: string
  definition: string
  roles: string[]
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
}

// Storage bucket configuration
export type BucketConfig = {
  name: string
  public: boolean
  fileSizeLimit: number
  allowedMimeTypes: string[]
}