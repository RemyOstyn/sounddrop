import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SampleWithDetails, SampleSortField, SortOrder } from '@/types/database';
import type { SampleWhereInput, SampleOrderByWithRelationInput } from '@/types/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const categoryId = searchParams.get('categoryId');
    const libraryId = searchParams.get('libraryId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: SampleWhereInput = {
      library: {
        isPublic: true,
        ...(categoryId && { categoryId })
      }
    };

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

    // Build order by
    const orderBy: SampleOrderByWithRelationInput = {
      [sortBy as SampleSortField]: sortOrder as SortOrder
    };

    // Execute queries
    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where,
        orderBy,
        skip,
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
      }),
      prisma.sample.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return NextResponse.json({
      samples,
      total,
      page,
      limit,
      totalPages,
      hasNextPage
    });

  } catch (error) {
    console.error('Error fetching samples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch samples' },
      { status: 500 }
    );
  }
}