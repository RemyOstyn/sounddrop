import { prisma } from '@/lib/prisma';

export interface CategoryWithStats {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string;
  order: number;
  createdAt: Date;
  _count: {
    libraries: number;
    samples: number;
  };
  contributorCount: number;
}

export async function getCategoryForMetadata(slug: string): Promise<CategoryWithStats | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            libraries: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    // Get sample count and contributor count for this category
    const [sampleCount, contributorCount] = await Promise.all([
      prisma.sample.count({
        where: {
          library: {
            categoryId: category.id,
            isPublic: true,
          },
        },
      }),
      prisma.library.findMany({
        where: {
          categoryId: category.id,
          isPublic: true,
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      }).then(users => users.length),
    ]);

    return {
      ...category,
      _count: {
        libraries: category._count.libraries,
        samples: sampleCount,
      },
      contributorCount,
    } as CategoryWithStats;
  } catch (error) {
    console.error('Error fetching category for metadata:', error);
    return null;
  }
}