import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { ALLOWED_AUDIO_TYPES, STORAGE_BUCKETS } from '@/lib/constants';

// Rate limiting disabled

// POST - Upload audio file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting disabled

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const libraryId = formData.get('libraryId') as string;

    // Validate required fields
    if (!file || !name || !libraryId) {
      return NextResponse.json(
        { error: 'File, name, and library ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type as typeof ALLOWED_AUDIO_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // File size validation disabled

    // Validate name length
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Sample name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if library exists and user owns it
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
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

    // Check if sample with same name exists in library
    const existingSample = await prisma.sample.findFirst({
      where: {
        libraryId,
        name: name.trim(),
      },
    });

    if (existingSample) {
      return NextResponse.json(
        { error: 'A sample with this name already exists in the library' },
        { status: 409 }
      );
    }

    // Rate limiting disabled

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'mp3';
    const fileName = `${user.id}/${timestamp}-${libraryId}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.AUDIO_SAMPLES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.AUDIO_SAMPLES)
      .getPublicUrl(fileName);

    // Extract audio duration (simplified - would need proper audio processing in production)
    // For now, we'll set duration to 0 and update it client-side if needed
    const duration = 0;

    // Create sample record in database
    const sample = await prisma.sample.create({
      data: {
        name: name.trim(),
        fileUrl: publicUrl,
        duration,
        fileSize: file.size,
        mimeType: file.type,
        libraryId,
      },
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
            category: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    return NextResponse.json({
      sample,
      message: 'Audio uploaded successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio' },
      { status: 500 }
    );
  }
}

