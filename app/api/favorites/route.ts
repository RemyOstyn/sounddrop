import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';


// GET - List user's favorites
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get favorites with sample details
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        sample: {
          include: {
            library: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                category: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.favorite.count({
      where: { userId },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: favorites,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });

  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add sample to favorites
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const { sampleId } = body;

    if (!sampleId || typeof sampleId !== 'string') {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    // Check if sample exists
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
    });

    if (!sample) {
      return NextResponse.json(
        { error: 'Sample not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: { userId, sampleId },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Sample already favorited' },
        { status: 409 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: { userId, sampleId },
      include: {
        sample: {
          include: {
            library: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                category: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(favorite, { status: 201 });

  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}