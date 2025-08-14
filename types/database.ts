// Core database model types - based on Prisma schema
export type User = {
  id: string
  email: string
  name: string | null // Deprecated: kept for migration
  username: string // Public identifier
  displayName: string | null // Optional friendly name
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
  order: number
  createdAt: Date
}

export type Library = {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  userId: string
  categoryId: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type Sample = {
  id: string
  name: string
  fileUrl: string
  duration: number
  fileSize: number
  mimeType: string
  libraryId: string
  playCount: number
  createdAt: Date
  updatedAt: Date
}

export type Favorite = {
  id: string
  userId: string
  sampleId: string
  createdAt: Date
}

// Extended types with relations
export type UserWithRelations = User & {
  libraries: Library[]
  favorites: (Favorite & {
    sample: Sample
  })[]
}

export type CategoryWithLibraries = Category & {
  libraries: (Library & {
    user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>
    _count: {
      samples: number
    }
  })[]
}

export type LibraryWithDetails = Library & {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>
  category: Category
  samples: Sample[]
  _count: {
    samples: number
  }
}

export type SampleWithDetails = Sample & {
  library: Library & {
    user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>
    category: Category
  }
  favorites: Favorite[]
  _count: {
    favorites: number
  }
}

export type FavoriteWithSample = Favorite & {
  sample: Sample & {
    library: Library & {
      user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>
      category: Category
    }
  }
}

// API response types
export type SampleWithFavoriteStatus = SampleWithDetails & {
  isFavorited?: boolean
}

export type LibraryWithSampleCount = LibraryWithDetails

export type CategoryWithStats = CategoryWithLibraries & {
  _count: {
    libraries: number
    samples: number
  }
}

// Form types
export type CreateLibraryData = {
  name: string
  description?: string
  categoryId: string
  iconFile?: File
  iconUrl?: string
}

export type CreateSampleData = {
  name: string
  libraryId: string
  audioFile: File
}

export type UpdateLibraryData = {
  name?: string
  description?: string | null
  categoryId?: string
  iconFile?: File
  iconUrl?: string | null
  isPublic?: boolean
}

// Search and filtering types
export type SampleFilters = {
  categoryId?: string
  libraryId?: string
  search?: string
  userId?: string
  isFavorited?: boolean
  sortBy?: SampleSortField
  sortOrder?: SortOrder
}

export type LibraryFilters = {
  categoryId?: string
  userId?: string
  search?: string
  isPublic?: boolean
}

export type SortOrder = 'asc' | 'desc'

export type SampleSortField = 'name' | 'createdAt' | 'playCount' | 'duration'

export type LibrarySortField = 'name' | 'createdAt' | 'updatedAt'

export type PaginationParams = {
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}