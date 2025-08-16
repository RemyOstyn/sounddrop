import type { Metadata } from 'next';
import { getCategoryForMetadata } from '@/lib/server/category';
import { APP_NAME } from '@/lib/constants';
import { CategoryDetailClient } from '@/components/category/category-detail-client';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryForMetadata(slug);

  if (!category) {
    return {
      title: `Category Not Found | ${APP_NAME}`,
      description: 'The requested category could not be found.',
    };
  }

  const title = `${category.name} | ${APP_NAME}`;
  const description = `${category.description} - Browse ${category._count.samples} audio samples across ${category._count.libraries} libraries from ${category.contributorCount} contributors.`;

  return {
    title,
    description,
    openGraph: {
      title: category.name,
      description,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: APP_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  return <CategoryDetailClient slug={slug} />;
}