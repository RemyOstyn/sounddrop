'use server';

import { prisma } from '@/lib/prisma';
import { 
  SampleWithDetails, 
  SampleFilters, 
  PaginatedResponse,
  SortOrder,
  SampleSortField 
} from '@/types/database';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { SampleWhereInput, SampleOrderByWithRelationInput } from '@/types/prisma';

// Get samples with pagination and filters
export async function getSamples({
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  categoryId,
  libraryId,
  search,
  userId,
  isFavorited,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}: SampleFilters & {
  page?: number;
  limit?: number;
  sortBy?: SampleSortField;
  sortOrder?: SortOrder;
} = {}): Promise<PaginatedResponse<SampleWithDetails>> {
  
  // Validate pagination
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  // Build where clause - using Record for dynamic construction
  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.library = {
      categoryId
    };
  }

  if (libraryId) {
    where.libraryId = libraryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { 
        library: {
          name: { contains: search, mode: 'insensitive' }
        }
      },
      {
        library: {
          user: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      }
    ];
  }

  if (userId) {
    const currentLibrary = where.library as Record<string, unknown> || {};
    where.library = {
      ...currentLibrary,
      userId
    };
  }

  if (isFavorited) {
    // Get current user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      where.favorites = {
        some: {
          userId: user.id
        }
      };
    }
  }

  // Only show public libraries and samples
  const currentLibrary = where.library as Record<string, unknown> || {};
  where.library = {
    ...currentLibrary,
    isPublic: true
  };

  // Build order by
  const orderBy: SampleOrderByWithRelationInput = {
    [sortBy as SampleSortField]: sortOrder as SortOrder
  };

  try {
    // Execute queries in parallel
    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where: where as SampleWhereInput,
        orderBy,
        skip,
        take: safeLimit,
        include: {
          library: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              },
              category: true
            }
          },
          favorites: true,
          _count: {
            select: {
              favorites: true
            }
          }
        }
      }),
      prisma.sample.count({ where: where as SampleWhereInput })
    ]);

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;

    return {
      data: samples,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage,
      hasPrevPage
    };

  } catch (error) {
    console.error('Error fetching samples:', error);
    throw new Error('Failed to fetch samples');
  }
}

// Get trending samples (last 24 hours)
export async function getTrendingSamples({
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  hours = 24
}: {
  page?: number;
  limit?: number;
  hours?: number;
} = {}): Promise<PaginatedResponse<SampleWithDetails>> {
  
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  // Calculate the date threshold
  const dateThreshold = new Date();
  dateThreshold.setHours(dateThreshold.getHours() - hours);

  const where = {
    library: {
      isPublic: true
    },
    // Only include samples that have been played recently
    OR: [
      {
        updatedAt: {
          gte: dateThreshold
        },
        playCount: {
          gt: 0
        }
      },
      {
        // Or samples with high play counts
        playCount: {
          gt: 10
        }
      }
    ]
  };

  try {
    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where,
        orderBy: [
          { playCount: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip,
        take: safeLimit,
        include: {
          library: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              },
              category: true
            }
          },
          favorites: true,
          _count: {
            select: {
              favorites: true
            }
          }
        }
      }),
      prisma.sample.count({ where: where as SampleWhereInput })
    ]);

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;

    return {
      data: samples,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage,
      hasPrevPage
    };

  } catch (error) {
    console.error('Error fetching trending samples:', error);
    throw new Error('Failed to fetch trending samples');
  }
}

// Get sample by ID
export async function getSampleById(id: string): Promise<SampleWithDetails | null> {
  try {
    const sample = await prisma.sample.findUnique({
      where: { id },
      include: {
        library: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            category: true
          }
        },
        favorites: true,
        _count: {
          select: {
            favorites: true
          }
        }
      }
    });

    return sample;
  } catch (error) {
    console.error('Error fetching sample:', error);
    return null;
  }
}

// Increment play count
export async function incrementPlayCount(sampleId: string): Promise<void> {
  try {
    await prisma.sample.update({
      where: { id: sampleId },
      data: {
        playCount: { increment: 1 },
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    throw new Error('Failed to update play count');
  }
}

// Get user's favorite samples
export async function getUserFavorites({
  page = 1,
  limit = DEFAULT_PAGE_SIZE
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResponse<SampleWithDetails> | null> {
  
  // Get current user from Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  try {
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          sample: {
            include: {
              library: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true
                    }
                  },
                  category: true
                }
              },
              favorites: true,
              _count: {
                select: {
                  favorites: true
                }
              }
            }
          }
        }
      }),
      prisma.favorite.count({ where: { userId: user.id } })
    ]);

    const samples = favorites.map(fav => fav.sample);
    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPrevPage = safePage > 1;

    return {
      data: samples,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage,
      hasPrevPage
    };

  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw new Error('Failed to fetch favorites');
  }
}

// Toggle favorite status
export async function toggleFavorite(sampleId: string): Promise<{ isFavorited: boolean }> {
  // Get current user from Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_sampleId: {
          userId: user.id,
          sampleId
        }
      }
    });

    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return { isFavorited: false };
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId: user.id,
          sampleId
        }
      });
      return { isFavorited: true };
    }

  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to toggle favorite');
  }
}

// Get recent samples
export async function getRecentSamples(limit: number = 10): Promise<SampleWithDetails[]> {
  try {
    const samples = await prisma.sample.findMany({
      where: {
        library: {
          isPublic: true
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        library: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            category: true
          }
        },
        favorites: true,
        _count: {
          select: {
            favorites: true
          }
        }
      }
    });

    return samples;
  } catch (error) {
    console.error('Error fetching recent samples:', error);
    return [];
  }
}