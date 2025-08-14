'use client';

import { useState, useEffect, useCallback } from 'react';

interface Stats {
  totalSamples: string;
  totalLibraries: string;
  totalUsers: string;
  recentSamples: string;
  raw: {
    totalSamples: number;
    totalLibraries: number;
    totalUsers: number;
    recentSamples: number;
  };
}

export interface UseStatsResult {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function useStats(autoFetch = true): UseStatsResult {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stats on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}