'use server';

import { prisma } from '@/lib/prisma';
import { 
  Category,
  CategoryWithLibraries,
  CategoryWithStats,
  LibraryWithDetails
} from '@/types/database';
import type { LibraryOrderByWithRelationInput } from '@/types/prisma';

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug }
    });
    
    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

// Get category with libraries
export async function getCategoryWithLibraries(
  slug: string,
  limit?: number
): Promise<CategoryWithLibraries | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        libraries: {
          where: {
            isPublic: true
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                samples: true
              }
            }
          }
        }
      }
    });
    
    return category;
  } catch (error) {
    console.error('Error fetching category with libraries:', error);
    return null;
  }
}

// Get categories with stats
export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        libraries: {
          where: {
            isPublic: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                samples: true
              }
            }
          }
        },
        _count: {
          select: {
            libraries: true
          }
        }
      }
    });

    // Transform to include sample counts
    const categoriesWithStats: CategoryWithStats[] = categories.map(category => ({
      ...category,
      _count: {
        libraries: category._count.libraries,
        samples: category.libraries.reduce((total, library) => total + library._count.samples, 0)
      }
    }));
    
    return categoriesWithStats;
  } catch (error) {
    console.error('Error fetching categories with stats:', error);
    throw new Error('Failed to fetch categories with stats');
  }
}

// Get popular categories (by sample count)
export async function getPopularCategories(limit: number = 10): Promise<CategoryWithStats[]> {
  try {
    const categories = await getCategoriesWithStats();
    
    // Sort by total sample count
    const popularCategories = categories
      .sort((a, b) => b._count.samples - a._count.samples)
      .slice(0, limit);
    
    return popularCategories;
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return [];
  }
}

// Search categories
export async function searchCategories(query: string): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { order: 'asc' }
    });
    
    return categories;
  } catch (error) {
    console.error('Error searching categories:', error);
    return [];
  }
}

// Get category libraries with pagination
export async function getCategoryLibraries(
  categoryId: string,
  {
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  }: {
    page?: number;
    limit?: number;
    sortBy?: 'updatedAt' | 'createdAt' | 'name';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  libraries: LibraryWithDetails[];
  total: number;
  hasNextPage: boolean;
}> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const orderBy: LibraryOrderByWithRelationInput = {
    [sortBy]: sortOrder
  };

  try {
    const [libraries, total] = await Promise.all([
      prisma.library.findMany({
        where: {
          categoryId,
          isPublic: true
        },
        orderBy,
        skip,
        take: safeLimit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          category: true,
          samples: {
            take: 5, // Preview samples
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              samples: true
            }
          }
        }
      }),
      prisma.library.count({
        where: {
          categoryId,
          isPublic: true
        }
      })
    ]);

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;

    return {
      libraries,
      total,
      hasNextPage
    };
  } catch (error) {
    console.error('Error fetching category libraries:', error);
    throw new Error('Failed to fetch category libraries');
  }
}