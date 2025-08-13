import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sampleId = params.id;

    // Increment play count
    await prisma.sample.update({
      where: { id: sampleId },
      data: {
        playCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking play:', error);
    return NextResponse.json(
      { error: 'Failed to track play' },
      { status: 500 }
    );
  }
}