'use client';

import { useState, useCallback, useEffect } from 'react';
import { Category, SampleWithDetails } from '@/types/database';

interface CategoryStats {
  sampleCount: number;
  libraryCount: number;
  contributorCount: number;
}

export interface UseCategoryResult {
  category: Category | null;
  stats: CategoryStats | null;
  trendingSamples: SampleWithDetails[];
  isLoading: boolean;
  error: string | null;
  fetchCategory: (slug: string) => Promise<void>;
}

export function useCategory(): UseCategoryResult {
  const [category, setCategory] = useState<Category | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [trendingSamples, setTrendingSamples] = useState<SampleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/categories/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Category not found');
        }
        throw new Error(`Failed to fetch category: ${response.statusText}`);
      }

      const data = await response.json();
      setCategory(data.category);
      setStats(data.stats);
      setTrendingSamples(data.trendingSamples);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch category';
      setError(errorMessage);
      console.error('Error fetching category:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    category,
    stats,
    trendingSamples,
    isLoading,
    error,
    fetchCategory,
  };
}