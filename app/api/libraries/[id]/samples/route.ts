import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET - Get samples in a library
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const libraryId = params.id;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    if (!libraryId) {
      return NextResponse.json(
        { error: 'Library ID is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated (for favorite status)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if library exists and is accessible
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      select: {
        id: true,
        isPublic: true,
        userId: true,
      },
    });

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    // Check if library is accessible (public or owned by user)
    if (!library.isPublic && (!user || library.userId !== user.id)) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { libraryId };
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Build order by clause
    const orderBy: { [key: string]: string } = {};
    orderBy[sortBy] = sortOrder;

    // Get samples with related data
    const samples = await prisma.sample.findMany({
      where,
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
        favorites: user ? {
          where: { userId: user.id },
          select: { id: true },
        } : false,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Add favorite status to each sample
    const samplesWithFavoriteStatus = samples.map(sample => ({
      ...sample,
      isFavorited: user ? sample.favorites.length > 0 : false,
    }));

    // Get total count for pagination
    const total = await prisma.sample.count({ where });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: samplesWithFavoriteStatus,
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
    console.error('Library samples GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library samples' },
      { status: 500 }
    );
  }
}