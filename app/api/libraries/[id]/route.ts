import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET - Get library by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const libraryId = resolvedParams.id;

    if (!libraryId) {
      return NextResponse.json(
        { error: 'Library ID is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated (for ownership check)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
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
        samples: {
          include: {
            _count: {
              select: {
                favorites: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            samples: true,
          },
        },
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

    return NextResponse.json(library);

  } catch (error) {
    console.error('Library GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

// PATCH - Update library
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const libraryId = resolvedParams.id;
    const body = await request.json();
    const { name, description, categoryId, iconUrl, isPublic } = body;

    if (!libraryId) {
      return NextResponse.json(
        { error: 'Library ID is required' },
        { status: 400 }
      );
    }

    // Check if library exists and user owns it
    const existingLibrary = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!existingLibrary) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    if (existingLibrary.userId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Validate fields if provided
    if (name && name.length > 100) {
      return NextResponse.json(
        { error: 'Library name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Check if category exists if changing category
    if (categoryId && categoryId !== existingLibrary.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Check for duplicate name if changing name
    if (name && name.trim() !== existingLibrary.name) {
      const duplicateLibrary = await prisma.library.findFirst({
        where: {
          userId: user.id,
          name: name.trim(),
          id: { not: libraryId },
        },
      });

      if (duplicateLibrary) {
        return NextResponse.json(
          { error: 'You already have a library with this name' },
          { status: 409 }
        );
      }
    }

    // Build update data
    interface UpdateData {
      name?: string;
      description?: string | null;
      categoryId?: string;
      iconUrl?: string | null;
      isPublic?: boolean;
    }

    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Update library
    const updatedLibrary = await prisma.library.update({
      where: { id: libraryId },
      data: updateData,
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

    return NextResponse.json(updatedLibrary);

  } catch (error) {
    console.error('Library PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update library' },
      { status: 500 }
    );
  }
}

// DELETE - Delete library
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const libraryId = resolvedParams.id;

    if (!libraryId) {
      return NextResponse.json(
        { error: 'Library ID is required' },
        { status: 400 }
      );
    }

    // Check if library exists and user owns it
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: {
        _count: {
          select: {
            samples: true,
          },
        },
      },
    });

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    if (library.userId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete library (samples will be deleted automatically due to cascade)
    await prisma.library.delete({
      where: { id: libraryId },
    });

    return NextResponse.json({
      message: 'Library deleted successfully',
      deletedSamples: library._count.samples,
    });

  } catch (error) {
    console.error('Library DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete library' },
      { status: 500 }
    );
  }
}