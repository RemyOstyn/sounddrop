'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: AnimatePresence will be used for grid transitions and filtering animations
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { SampleCard, SampleCardSkeleton } from './sample-card';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { SampleWithDetails, SampleFilters } from '@/types/database';
import { cn } from '@/lib/utils';


interface SampleGridProps {
  view?: 'grid' | 'list';
  filters?: SampleFilters;
  className?: string;
  onSamplePlay?: (sampleId: string) => void;
  onSampleFavorite?: (sampleId: string, isFavorited: boolean) => void;
  getUserFavorites?: (sampleIds: string[]) => Record<string, boolean>;
}


export function SampleGrid({
  view = 'grid',
  filters = {},
  className,
  onSamplePlay, // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Will be used for global audio state management
  onSampleFavorite,
  getUserFavorites // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Will be used for user-specific favorite state
}: SampleGridProps) {
  const [userFavorites, setUserFavorites] = useState<Record<string, boolean>>({});

  // Fetcher function for infinite scroll
  const fetcher = useCallback(async (page: number, pageSize: number) => {
    // Build query parameters
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());
    
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
    
    return {
      data: data.samples,
      total: data.total,
      hasNextPage: data.hasNextPage
    };
  }, [filters]);

  const {
    data: displaySamples,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    ref: loadMoreRef,
    refresh
  } = useInfiniteScroll<SampleWithDetails>(fetcher, {
    pageSize: 20,
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Reset infinite scroll when filters change
  useEffect(() => {
    refresh();
  }, [filters, refresh]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((sampleId: string, isFavorited: boolean) => {
    setUserFavorites(prev => ({ ...prev, [sampleId]: isFavorited }));
    onSampleFavorite?.(sampleId, isFavorited);
  }, [onSampleFavorite]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Grid layout classes
  const gridClasses = {
    grid: 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
    list: 'flex flex-col space-y-3'
  };

  // Loading state
  if (isLoading && displaySamples.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className={gridClasses[view]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SampleCardSkeleton key={i} view={view} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && displaySamples.length === 0) {
    return (
      <div className={cn('w-full flex flex-col items-center justify-center py-12', className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="w-16 h-16 mx-auto rounded-full glass flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center space-x-2 px-4 py-2 glass glass-hover rounded-lg text-white transition-colors"
          >
            <RotateCcw size={16} />
            <span>Try again</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && displaySamples.length === 0) {
    return (
      <div className={cn('w-full flex flex-col items-center justify-center py-12', className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="w-16 h-16 mx-auto rounded-full glass flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🎵
            </motion.div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">No samples found</h3>
            <p className="text-white/60 text-sm">
              Try adjusting your filters or check back later for new content.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Sample Grid */}
      <motion.div
        className={gridClasses[view]}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {displaySamples.map((sample) => (
          <motion.div
            key={sample.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <SampleCard
              sample={sample}
              view={view}
              isUserFavorited={userFavorites[sample.id] || false}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3 p-4 glass rounded-lg"
            >
              <Loader2 size={20} className="animate-spin text-purple-400" />
              <span className="text-white/70">Loading more samples...</span>
            </motion.div>
          )}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && displaySamples.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 text-white/50 text-sm">
            <span>🎉</span>
            <span>You&apos;ve reached the end! {displaySamples.length} samples loaded.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactSampleGrid({
  samples,
  view = 'grid',
  className,
  maxItems = 6
}: {
  samples: SampleWithDetails[];
  view?: 'grid' | 'list';
  className?: string;
  maxItems?: number;
}) {
  const displaySamples = samples.slice(0, maxItems);

  const gridClasses = {
    grid: 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-3',
    list: 'flex flex-col space-y-2'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={gridClasses[view]}>
        {displaySamples.map((sample, index) => (
          <motion.div
            key={sample.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SampleCard
              sample={sample}
              view={view}
              showPlayCount={false}
              showFavoriteCount={false}
              className="h-32"
            />
          </motion.div>
        ))}
      </div>
      
      {samples.length > maxItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <div className="text-white/60 text-sm">
            +{samples.length - maxItems} more samples
          </div>
        </motion.div>
      )}
    </div>
  );
}