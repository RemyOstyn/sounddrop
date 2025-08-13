'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

export interface InfiniteScrollOptions<T> {
  initialData?: T[];
  pageSize?: number;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export interface InfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  ref: (node?: Element | null) => void;
  inView: boolean;
}

export function useInfiniteScroll<T>(
  fetcher: (page: number, pageSize: number) => Promise<{
    data: T[];
    total: number;
    hasNextPage: boolean;
  }>,
  options: InfiniteScrollOptions<T> = {}
): InfiniteScrollResult<T> {
  const {
    initialData = [],
    pageSize = 20,
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const isInitialLoad = useRef(true);
  const isFetching = useRef(false);

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    skip: !enabled
  });

  const loadPage = useCallback(async (pageNumber: number, isRefresh = false) => {
    if (isFetching.current) return;
    
    isFetching.current = true;
    setError(null);

    const isFirst = pageNumber === 1;
    const isInitial = isFirst && isInitialLoad.current;

    if (isInitial || isRefresh) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await fetcher(pageNumber, pageSize);
      
      if (isFirst || isRefresh) {
        setData(result.data);
        setPage(2);
      } else {
        setData(prev => [...prev, ...result.data]);
        setPage(prev => prev + 1);
      }
      
      setTotal(result.total);
      setHasNextPage(result.hasNextPage);
      
      if (isInitial) {
        isInitialLoad.current = false;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [fetcher, pageSize]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoading || isLoadingMore) return;
    await loadPage(page);
  }, [loadPage, page, hasNextPage, isLoading, isLoadingMore]);

  const refresh = useCallback(async () => {
    setPage(1);
    await loadPage(1, true);
  }, [loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setTotal(0);
    setHasNextPage(true);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    isInitialLoad.current = true;
    isFetching.current = false;
  }, []);

  // Load initial data
  useEffect(() => {
    if (enabled && isInitialLoad.current && data.length === 0) {
      loadPage(1);
    }
  }, [enabled, loadPage, data.length]);

  // Auto-load when in view
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isLoadingMore && enabled) {
      loadMore();
    }
  }, [inView, hasNextPage, isLoading, isLoadingMore, enabled, loadMore]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    loadMore,
    refresh,
    reset,
    ref,
    inView
  };
}

// Hook for managing virtual scrolling with large datasets
export function useVirtualInfiniteScroll<T>(
  fetcher: (page: number, pageSize: number) => Promise<{
    data: T[];
    total: number;
    hasNextPage: boolean;
  }>,
  options: InfiniteScrollOptions<T> & {
    estimatedItemHeight?: number;
    overscan?: number;
  } = {}
) {
  const {
    estimatedItemHeight = 200,
    overscan = 5,
    ...infiniteOptions
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const infiniteResult = useInfiniteScroll(fetcher, infiniteOptions);

  // Track container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Virtual scrolling calculations
  const totalHeight = infiniteResult.data.length * estimatedItemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / estimatedItemHeight) - overscan);
  const endIndex = Math.min(
    infiniteResult.data.length - 1,
    Math.floor((scrollTop + containerHeight) / estimatedItemHeight) + overscan
  );

  const visibleItems = infiniteResult.data.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * estimatedItemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...infiniteResult,
    containerRef,
    containerHeight,
    totalHeight,
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    onScroll: handleScroll
  };
}