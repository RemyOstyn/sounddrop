import type { Metadata } from 'next';
import { getLibraryForMetadata } from '@/lib/server/library';
import { getUserDisplayName } from '@/lib/user-display-utils';
import { APP_NAME } from '@/lib/constants';
import { LibraryDetailClient } from '@/components/library/library-detail-client';

interface LibraryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LibraryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const library = await getLibraryForMetadata(id);

  if (!library) {
    return {
      title: `Library Not Found | ${APP_NAME}`,
      description: 'The requested library could not be found.',
    };
  }

  const title = `${library.name} | ${APP_NAME}`;
  const description = library.description 
    ? `${library.description} - A collection of ${library._count.samples} audio samples by ${getUserDisplayName(library.user)}.`
    : `A collection of ${library._count.samples} audio samples by ${getUserDisplayName(library.user)} in the ${library.category.name} category.`;

  const images = library.iconUrl ? [
    {
      url: library.iconUrl,
      width: 512,
      height: 512,
      alt: library.name,
    },
  ] : [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: APP_NAME,
    },
  ];

  return {
    title,
    description,
    openGraph: {
      title: library.name,
      description,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: library.name,
      description,
      images: images.map(img => img.url),
    },
  };
}

export default async function LibraryDetailPage({ params }: LibraryDetailPageProps) {
  const { id } = await params;
  
  return <LibraryDetailClient libraryId={id} />;
}