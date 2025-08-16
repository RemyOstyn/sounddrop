import { prisma } from '@/lib/prisma';

export interface LibraryForMetadata {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    icon: string;
    order: number;
    createdAt: Date;
  };
  _count: {
    samples: number;
  };
}

export async function getLibraryForMetadata(id: string): Promise<LibraryForMetadata | null> {
  try {
    const library = await prisma.library.findUnique({
      where: { id },
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

    // Only return public libraries for metadata generation
    if (!library || !library.isPublic) {
      return null;
    }

    return library;
  } catch (error) {
    console.error('Error fetching library for metadata:', error);
    return null;
  }
}