'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { SampleCard, SampleCardSkeleton } from './sample-card';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { SampleWithDetails, SampleFilters } from '@/types/database';
import { cn } from '@/lib/utils';

interface SampleGridData {
  samples: SampleWithDetails[];
  total: number;
  hasNextPage: boolean;
}

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
  onSamplePlay,
  onSampleFavorite,
  getUserFavorites
}: SampleGridProps) {
  const [userFavorites, setUserFavorites] = useState<Record<string, boolean>>({});

  // Fetcher function for infinite scroll
  const fetcher = useCallback(async (page: number, pageSize: number) => {
    // Mock data for demo purposes (replace with actual API call once database is connected)
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockSamples: SampleWithDetails[] = Array.from({ length: pageSize }, (_, i) => {
      const sampleIndex = (page - 1) * pageSize + i;
      return {
        id: `sample-${sampleIndex}`,
        name: `Amazing Sample ${sampleIndex + 1}`,
        fileUrl: `https://example.com/sample-${sampleIndex}.mp3`,
        duration: Math.floor(Math.random() * 30) + 5,
        fileSize: Math.floor(Math.random() * 1000000) + 100000,
        mimeType: 'audio/mpeg',
        libraryId: `library-${Math.floor(sampleIndex / 5)}`,
        playCount: Math.floor(Math.random() * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        library: {
          id: `library-${Math.floor(sampleIndex / 5)}`,
          name: `Cool Library ${Math.floor(sampleIndex / 5) + 1}`,
          description: 'A collection of amazing sounds',
          iconUrl: null,
          userId: 'user-1',
          categoryId: 'memes',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'Demo User',
            avatar: null
          },
          category: {
            id: 'memes',
            name: 'Memes',
            slug: 'memes',
            icon: 'Laugh',
            description: 'Funny meme sounds',
            order: 0,
            createdAt: new Date()
          }
        },
        favorites: [],
        _count: {
          favorites: Math.floor(Math.random() * 50)
        }
      };
    });

    return {
      data: mockSamples,
      total: 100, // Mock total
      hasNextPage: page < 5 // Mock hasNextPage
    };
  }, [filters]);

  const {
    data: samples,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    refresh,
    ref: loadMoreRef
  } = useInfiniteScroll(fetcher, {
    pageSize: 20,
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((sampleId: string, isFavorited: boolean) => {
    setUserFavorites(prev => ({ ...prev, [sampleId]: isFavorited }));
    onSampleFavorite?.(sampleId, isFavorited);
  }, [onSampleFavorite]);

  // Grid layout classes
  const gridClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
    list: 'flex flex-col space-y-3'
  };

  // Loading state
  if (isLoading && samples.length === 0) {
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
  if (error && samples.length === 0) {
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
            onClick={refresh}
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
  if (!isLoading && samples.length === 0) {
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
        {samples.map((sample) => (
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
      {!hasNextPage && samples.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 text-white/50 text-sm">
            <span>🎉</span>
            <span>You&apos;ve reached the end! {samples.length} samples loaded.</span>
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
    grid: 'grid grid-cols-2 sm:grid-cols-3 gap-3',
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