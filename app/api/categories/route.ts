import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            libraries: {
              where: {
                isPublic: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: categories,
    });

  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}