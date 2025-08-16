import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';
import { TrendingClient } from '@/components/trending/trending-client';

export const metadata: Metadata = {
  title: `Trending | ${APP_NAME}`,
  description: 'Discover the hottest and most popular audio samples trending right now. Find viral sounds, popular clips, and the most played samples from the community.',
  openGraph: {
    title: 'Trending Sounds',
    description: 'Discover the hottest and most popular audio samples trending right now on SoundDrop.',
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
    title: 'Trending Sounds',
    description: 'Discover the hottest and most popular audio samples trending right now on SoundDrop.',
    images: ['/og-image.png'],
  },
};

export default function TrendingPage() {
  return <TrendingClient />;
}