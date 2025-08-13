// File upload constants
export const MAX_AUDIO_SIZE_MB = parseInt(process.env.MAX_AUDIO_SIZE_MB || '50')
export const MAX_ICON_SIZE_MB = parseInt(process.env.MAX_ICON_SIZE_MB || '2')

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav', 
  'audio/mp3',
  'audio/mp4',
  'audio/ogg'
] as const

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const

// Supabase storage bucket names
export const STORAGE_BUCKETS = {
  AUDIO_SAMPLES: 'audio-samples',
  LIBRARY_ICONS: 'library-icons'
} as const

// App-wide constants
export const APP_NAME = 'SoundDrop'
export const APP_DESCRIPTION = 'The Pocket Soundboard - Instant access to your favorite sounds'

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Rate limiting
export const UPLOAD_RATE_LIMIT = {
  MAX_UPLOADS_PER_HOUR: 10,
  WINDOW_MS: 60 * 60 * 1000 // 1 hour in milliseconds
} as const

// Audio player settings
export const AUDIO_SETTINGS = {
  PRELOAD_STRATEGY: 'metadata' as const,
  DEFAULT_VOLUME: 0.7,
  FADE_DURATION_MS: 300
} as const

// Routes that require authentication
export const PROTECTED_ROUTES = [
  '/favorites',
  '/my-libraries', 
  '/upload'
] as const

// Default categories (matching seed data)
export const DEFAULT_CATEGORIES = [
  { name: 'Memes', slug: 'memes', icon: 'Laugh' },
  { name: 'Movies', slug: 'movies', icon: 'Film' },
  { name: 'TV Shows', slug: 'tv-shows', icon: 'Tv' },
  { name: 'Games', slug: 'games', icon: 'Gamepad2' },
  { name: 'Reactions', slug: 'reactions', icon: 'MessageCircle' },
  { name: 'Music', slug: 'music', icon: 'Music' },
  { name: 'Animals', slug: 'animals', icon: 'Cat' },
  { name: 'Sports', slug: 'sports', icon: 'Trophy' },
  { name: 'Sound Effects', slug: 'sound-effects', icon: 'Volume2' },
  { name: 'Other', slug: 'other', icon: 'FolderOpen' }
] as const