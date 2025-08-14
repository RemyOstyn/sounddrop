'use client';

import { SampleCard } from './sample-card';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/hooks/use-auth';
import type { SampleWithDetails } from '@/types/database';

interface FavoriteSampleCardProps {
  sample: SampleWithDetails;
  view?: 'grid' | 'list';
  showPlayCount?: boolean;
  showFavoriteCount?: boolean;
  className?: string;
  onFavoriteChange?: (sampleId: string, isFavorited: boolean) => void;
}

export function FavoriteSampleCard({
  sample,
  view = 'grid',
  showPlayCount = true,
  showFavoriteCount = true,
  className,
  onFavoriteChange
}: FavoriteSampleCardProps) {
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const isUserFavorited = isAuthenticated ? isFavorite(sample.id) : false;

  const handleFavoriteToggle = async (sampleId: string, willBeFavorited: boolean) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
      return;
    }

    try {
      await toggleFavorite(sampleId);
      onFavoriteChange?.(sampleId, willBeFavorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Error toast is handled by the favorites hook
    }
  };

  return (
    <SampleCard
      sample={sample}
      view={view}
      showPlayCount={showPlayCount}
      showFavoriteCount={showFavoriteCount}
      isUserFavorited={isUserFavorited}
      onFavoriteToggle={handleFavoriteToggle}
      className={className}
    />
  );
}