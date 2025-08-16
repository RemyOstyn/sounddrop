import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import { LibrariesClient } from '@/components/libraries/libraries-client';

export const metadata: Metadata = {
  title: `Community Libraries | ${APP_NAME}`,
  description: 'Discover amazing audio collections from creators around the world. Browse community libraries filled with samples, sound effects, and audio clips organized by category.',
  openGraph: {
    title: 'Community Libraries',
    description: 'Discover amazing audio collections from creators around the world on SoundDrop.',
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
    title: 'Community Libraries',
    description: 'Discover amazing audio collections from creators around the world on SoundDrop.',
    images: ['/og-image.png'],
  },
};

export default function LibrariesPage() {
  return <LibrariesClient />;
}