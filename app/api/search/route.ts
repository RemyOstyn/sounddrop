import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        samples: [],
        libraries: [],
        users: []
      });
    }

    const searchTerm = query.trim();
    const limit = 10; // Limit results for search suggestions

    // Search in parallel
    const [samples, libraries, users] = await Promise.all([
      // Search samples
      prisma.sample.findMany({
        where: {
          AND: [
            {
              library: {
                isPublic: true
              }
            },
            {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                {
                  library: {
                    name: { contains: searchTerm, mode: 'insensitive' }
                  }
                }
              ]
            }
          ]
        },
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
              }
            }
          },
          _count: {
            select: {
              favorites: true
            }
          }
        },
        orderBy: { playCount: 'desc' }
      }),
      
      // Search libraries
      prisma.library.findMany({
        where: {
          AND: [
            { isPublic: true },
            { name: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
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
        },
        orderBy: { updatedAt: 'desc' }
      }),
      
      // Search users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          _count: {
            select: {
              libraries: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      samples,
      libraries,
      users
    });

  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}