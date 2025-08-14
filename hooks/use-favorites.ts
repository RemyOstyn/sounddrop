'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { FavoriteWithSample } from '@/types/database';
import { toast } from 'sonner';

interface UseFavoritesReturn {
  favorites: FavoriteWithSample[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (sampleId: string) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  isFavorite: (sampleId: string) => boolean;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithSample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async (pageNum = 1, append = false) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      
      if (append) {
        setFavorites(prev => [...prev, ...data.data]);
      } else {
        setFavorites(data.data);
      }
      
      setHasMore(data.pagination.hasNextPage);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorites';
      setError(errorMessage);
      console.error('Fetch favorites error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(async (sampleId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be authenticated to favorite samples');
    }

    const existingFavorite = favorites.find(fav => fav.sample.id === sampleId);
    
    if (existingFavorite) {
      // Remove favorite
      await removeFavorite(existingFavorite.id);
    } else {
      // Add favorite - optimistic update
      setOptimisticUpdates(prev => new Set(prev).add(sampleId));
      
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sampleId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add favorite');
        }

        const newFavorite = await response.json();
        
        // Add to favorites list
        setFavorites(prev => [newFavorite, ...prev]);
        toast.success('Added to favorites');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add favorite';
        setError(errorMessage);
        toast.error('Failed to add favorite', {
          description: errorMessage,
        });
        console.error('Add favorite error:', err);
        throw err;
      } finally {
        // Remove optimistic update
        setOptimisticUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(sampleId);
          return newSet;
        });
      }
    }
  }, [isAuthenticated, user, favorites]);

  const removeFavorite = useCallback(async (favoriteId: string) => {
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to remove favorites');
    }

    // Optimistic update - remove from list immediately
    const originalFavorites = favorites;
    setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));

    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      toast.success('Removed from favorites');

    } catch (err) {
      // Revert optimistic update on error
      setFavorites(originalFavorites);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove favorite';
      setError(errorMessage);
      toast.error('Failed to remove favorite', {
        description: errorMessage,
      });
      console.error('Remove favorite error:', err);
      throw err;
    }
  }, [isAuthenticated, favorites]);

  const isFavorite = useCallback((sampleId: string): boolean => {
    if (!isAuthenticated) return false;
    
    // Check both actual favorites and optimistic updates
    const isInFavorites = favorites.some(fav => fav.sample.id === sampleId);
    const isOptimisticUpdate = optimisticUpdates.has(sampleId);
    
    return isInFavorites || isOptimisticUpdate;
  }, [isAuthenticated, favorites, optimisticUpdates]);

  const refetch = useCallback(async () => {
    await fetchFavorites(1, false);
  }, [fetchFavorites]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchFavorites(page + 1, true);
    }
  }, [hasMore, isLoading, page, fetchFavorites]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      // Clear favorites when not authenticated
      setFavorites([]);
      setError(null);
      setPage(1);
      setHasMore(true);
    }
  }, [isAuthenticated, fetchFavorites]);

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    removeFavorite,
    isFavorite,
    refetch,
    hasMore,
    loadMore,
  };
}