import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// DELETE - Delete sample
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
    const sampleId = resolvedParams.id;

    if (!sampleId) {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    // Check if sample exists and get its library to verify ownership
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      include: {
        library: true
      }
    });

    if (!sample) {
      return NextResponse.json(
        { error: 'Sample not found' },
        { status: 404 }
      );
    }

    // Check if user owns the library containing this sample
    if (sample.library.userId !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete the audio file from Supabase storage
    const filePathParts = sample.fileUrl.split('/');
    const fileName = filePathParts[filePathParts.length - 1];
    
    try {
      await supabase.storage
        .from('audio-samples')
        .remove([fileName]);
    } catch (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete the sample from database
    await prisma.sample.delete({
      where: { id: sampleId }
    });

    return NextResponse.json({
      message: 'Sample deleted successfully'
    });

  } catch (error) {
    console.error('Sample DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sample' },
      { status: 500 }
    );
  }
}