import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET - List libraries (public and user's own)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const userId = url.searchParams.get('userId');
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');
    const offset = (page - 1) * limit;

    // Get user if authenticated (optional for public libraries)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { isPublic: true },
        ...(user ? [{ userId: user.id }] : [])
      ]
    };

    // Add filters
    if (userId) {
      // Handle special case: 'current' means authenticated user
      if (userId === 'current' && user) {
        where.userId = user.id;
      } else {
        where.userId = userId;
      }
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get libraries with related data
    const libraries = await prisma.library.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            samples: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.library.count({ where });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: libraries,
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
    console.error('Libraries GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch libraries' },
      { status: 500 }
    );
  }
}

// POST - Create new library
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, categoryId, iconUrl } = body;

    // Validate required fields
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Library name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if user already has a library with this name
    const existingLibrary = await prisma.library.findFirst({
      where: {
        userId: user.id,
        name: name.trim(),
      },
    });

    if (existingLibrary) {
      return NextResponse.json(
        { error: 'You already have a library with this name' },
        { status: 409 }
      );
    }

    // Create library
    const library = await prisma.library.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        categoryId,
        userId: user.id,
        iconUrl: iconUrl || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            samples: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: library
    }, { status: 201 });

  } catch (error) {
    console.error('Libraries POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create library' },
      { status: 500 }
    );
  }
}