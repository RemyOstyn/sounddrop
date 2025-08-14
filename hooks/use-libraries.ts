'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LibraryWithDetails, CreateLibraryData, UpdateLibraryData } from '@/types/database';
import { LibraryFilters, LibrariesResponse, LibraryResponse, LibraryDeleteResponse } from '@/types/api';

export interface UseLibrariesResult {
  libraries: LibraryWithDetails[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  
  // Actions
  fetchLibraries: (filters?: LibraryFilters) => Promise<void>;
  createLibrary: (data: CreateLibraryData) => Promise<LibraryWithDetails | null>;
  updateLibrary: (id: string, data: UpdateLibraryData) => Promise<LibraryWithDetails | null>;
  deleteLibrary: (id: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refreshLibraries: () => Promise<void>;
  
  // State management
  clearError: () => void;
}

export function useLibraries(initialFilters?: LibraryFilters): UseLibrariesResult {
  const [libraries, setLibraries] = useState<LibraryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start as false, let components control when to load
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Use refs for values that shouldn't trigger callback recreations
  const currentPageRef = useRef(1);
  const currentFiltersRef = useRef<LibraryFilters>(initialFilters || {});

  const fetchLibraries = useCallback(async (filters: LibraryFilters = {}, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      
      // Add filters to search params
      if (filters.userId) searchParams.set('userId', filters.userId);
      if (filters.categoryId) searchParams.set('categoryId', filters.categoryId);
      if (filters.search) searchParams.set('search', filters.search);
      
      const page = append ? currentPageRef.current + 1 : 1;
      searchParams.set('page', page.toString());
      searchParams.set('limit', (filters.limit || 20).toString());

      const response = await fetch(`/api/libraries?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch libraries');
      }

      const result: LibrariesResponse = await response.json();

      if (append) {
        setLibraries(prev => [...prev, ...result.data]);
        currentPageRef.current = page;
      } else {
        setLibraries(result.data);
        currentPageRef.current = 1;
        currentFiltersRef.current = filters;
      }

      setHasMore(result.pagination.hasNextPage);
      setTotalCount(result.pagination.total);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch libraries');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - function is now stable

  const createLibrary = useCallback(async (data: CreateLibraryData): Promise<LibraryWithDetails | null> => {
    try {
      setError(null);

      const response = await fetch('/api/libraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create library');
      }

      const result: LibraryResponse = await response.json();
      
      // Add to the beginning of the list
      setLibraries(prev => [result.data, ...prev]);
      setTotalCount(prev => prev + 1);

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create library';
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateLibrary = useCallback(async (id: string, data: UpdateLibraryData): Promise<LibraryWithDetails | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/libraries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update library');
      }

      const result: LibraryResponse = await response.json();
      
      // Update the library in the list
      setLibraries(prev => 
        prev.map(library => 
          library.id === id ? result.data : library
        )
      );

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update library';
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteLibrary = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/libraries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete library');
      }

      // Remove from the list
      setLibraries(prev => prev.filter(library => library.id !== id));
      setTotalCount(prev => prev - 1);

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete library';
      setError(errorMessage);
      return false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    await fetchLibraries(currentFiltersRef.current, true);
  }, [hasMore, isLoading, fetchLibraries]);

  const refreshLibraries = useCallback(async () => {
    await fetchLibraries(currentFiltersRef.current);
  }, [fetchLibraries]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Remove automatic initial fetch - let components control when to load

  return {
    libraries,
    isLoading,
    error,
    hasMore,
    totalCount,
    fetchLibraries,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    loadMore,
    refreshLibraries,
    clearError,
  };
}

// Hook for getting a single library
export function useLibrary(id: string) {
  const [library, setLibrary] = useState<LibraryWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibrary = useCallback(async (libraryId?: string) => {
    const targetId = libraryId || id;
    if (!targetId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/libraries/${targetId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const result: LibraryResponse = await response.json();
      setLibrary(result.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch library');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  return {
    library,
    isLoading,
    error,
    refetch: fetchLibrary,
  };
}