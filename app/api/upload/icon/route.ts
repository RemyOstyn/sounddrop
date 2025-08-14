import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ALLOWED_IMAGE_TYPES, MAX_ICON_SIZE_MB, STORAGE_BUCKETS } from '@/lib/constants';

// POST - Upload library icon
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const libraryId = formData.get('libraryId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSizeBytes = MAX_ICON_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_ICON_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `${user.id}/${timestamp}-${libraryId || 'temp'}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.LIBRARY_ICONS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Icon upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload icon' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.LIBRARY_ICONS)
      .getPublicUrl(fileName);

    return NextResponse.json({
      iconUrl: publicUrl,
      fileName,
      message: 'Icon uploaded successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Icon upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload icon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete library icon
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user (fileName should start with userId)
    if (!fileName.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKETS.LIBRARY_ICONS)
      .remove([fileName]);

    if (deleteError) {
      console.error('Icon delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete icon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Icon deleted successfully',
    });

  } catch (error) {
    console.error('Icon delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete icon' },
      { status: 500 }
    );
  }
}