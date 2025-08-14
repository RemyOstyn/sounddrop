'use client';

import { useState, useCallback, useRef } from 'react';
import { SampleWithDetails, SampleFilters } from '@/types/database';

export interface UseSamplesResult {
  samples: SampleWithDetails[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasNextPage: boolean;
  currentPage: number;
  fetchSamples: (filters?: SampleFilters, page?: number, append?: boolean) => Promise<void>;
  resetSamples: () => void;
}

export function useSamples(): UseSamplesResult {
  const [samples, setSamples] = useState<SampleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use refs for values that shouldn't trigger callback recreations
  const currentPageRef = useRef(1);
  const currentFiltersRef = useRef<SampleFilters>({});

  const fetchSamples = useCallback(async (
    filters: SampleFilters = {},
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      // Update refs
      currentPageRef.current = page;
      currentFiltersRef.current = filters;

      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      
      if (filters.categoryId) {
        params.set('categoryId', filters.categoryId);
      }
      if (filters.libraryId) {
        params.set('libraryId', filters.libraryId);
      }
      if (filters.search) {
        params.set('search', filters.search);
      }
      if (filters.sortBy) {
        params.set('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.set('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`/api/samples?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch samples: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (append && page > 1) {
        setSamples(prev => [...prev, ...data.samples]);
      } else {
        setSamples(data.samples);
      }
      
      setTotal(data.total);
      setHasNextPage(data.hasNextPage);
      setCurrentPage(page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch samples';
      setError(errorMessage);
      console.error('Error fetching samples:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetSamples = useCallback(() => {
    setSamples([]);
    setTotal(0);
    setHasNextPage(false);
    setCurrentPage(1);
    setError(null);
    currentPageRef.current = 1;
    currentFiltersRef.current = {};
  }, []);

  return {
    samples,
    isLoading,
    error,
    total,
    hasNextPage,
    currentPage,
    fetchSamples,
    resetSamples,
  };
}