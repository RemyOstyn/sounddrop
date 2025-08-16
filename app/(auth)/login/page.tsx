import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginContent } from './login-content';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Login | ${APP_NAME}`,
  description: 'Sign in to your SoundDrop account to access your favorites, create libraries, and upload audio samples.',
  openGraph: {
    title: 'Login to SoundDrop',
    description: 'Sign in to access your personal soundboard and audio collections.',
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
    title: 'Login to SoundDrop',
    description: 'Sign in to access your personal soundboard and audio collections.',
    images: ['/og-image.png'],
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}