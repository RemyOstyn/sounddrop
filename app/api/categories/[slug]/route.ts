import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get category by slug with stats
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    
    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            libraries: {
              where: {
                isPublic: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get additional stats
    const [sampleCount, contributorCount, trendingSamples] = await Promise.all([
      // Total samples in this category
      prisma.sample.count({
        where: {
          library: {
            categoryId: category.id,
            isPublic: true,
          },
        },
      }),
      
      // Number of unique contributors (users who created libraries in this category)
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
      
      // Top 5 trending samples in this category (by play count)
      prisma.sample.findMany({
        where: {
          library: {
            categoryId: category.id,
            isPublic: true,
          },
        },
        orderBy: {
          playCount: 'desc',
        },
        take: 5,
        include: {
          library: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const stats = {
      sampleCount,
      libraryCount: category._count.libraries,
      contributorCount,
    };

    return NextResponse.json({
      category,
      stats,
      trendingSamples,
    });

  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}