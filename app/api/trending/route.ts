import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const skip = (page - 1) * limit;

    // Calculate the date threshold for trending
    const dateThreshold = new Date();
    dateThreshold.setHours(dateThreshold.getHours() - hours);

    const where = {
      library: {
        isPublic: true
      },
      // Include samples that have been played recently or have high play counts
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
          playCount: {
            gt: 10
          }
        }
      ]
    };

    const [samples, total] = await Promise.all([
      prisma.sample.findMany({
        where,
        orderBy: [
          { playCount: 'desc' },
          { updatedAt: 'desc' }
        ],
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
    console.error('Error fetching trending samples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending samples' },
      { status: 500 }
    );
  }
}