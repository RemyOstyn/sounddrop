'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthPageLoading } from '@/components/auth/auth-loading';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  // Show loading state while auth is initializing
  if (!isInitialized || isLoading) {
    return <AuthPageLoading />;
  }

  // Show loading if not authenticated (during redirect)
  if (!isAuthenticated) {
    return <AuthPageLoading />;
  }

  // Render protected content
  return <>{children}</>;
}