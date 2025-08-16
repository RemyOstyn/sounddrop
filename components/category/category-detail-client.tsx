'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Volume2, Users, Library, TrendingUp, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import { SampleGrid } from '@/components/audio/sample-grid';
import { AudioVisualizer } from '@/components/audio/audio-visualizer';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { LoadingSpinner } from '@/components/shared/skeleton-loader';
import { useCategory } from '@/hooks/use-category';
import { useAudio, usePlayTracking } from '@/hooks/use-audio';
import { cn } from '@/lib/utils';
import { getUserDisplayName } from '@/lib/user-display-utils';

interface CategoryDetailClientProps {
  slug: string;
}

export function CategoryDetailClient({ slug }: CategoryDetailClientProps) {
  const { view, setView } = useViewToggle();
  const { category, stats, trendingSamples, isLoading, error, fetchCategory } = useCategory();

  // Fetch category data from API
  useEffect(() => {
    if (slug) {
      fetchCategory(slug);
    }
  }, [slug, fetchCategory]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    notFound();
  }

  // Guard clause: don't render if we don't have category data yet
  if (!category) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="px-6 py-8 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                <div className="p-4 rounded-2xl gradient-primary">
                  <Volume2 size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {category.name}
                  </h1>
                  <p className="text-white/60 text-lg">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ViewToggle view={view} onViewChange={setView} />
              </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CategoryStat
                icon={<Volume2 size={16} />}
                label="Total Samples"
                value={stats?.sampleCount?.toLocaleString() || (isLoading ? "..." : "0")}
                gradient="from-purple-500 to-pink-500"
                isLoading={isLoading}
              />
              <CategoryStat
                icon={<Library size={16} />}
                label="Libraries"
                value={stats?.libraryCount?.toLocaleString() || (isLoading ? "..." : "0")}
                gradient="from-blue-500 to-cyan-500"
                isLoading={isLoading}
              />
              <CategoryStat
                icon={<Users size={16} />}
                label="Contributors"
                value={stats?.contributorCount?.toLocaleString() || (isLoading ? "..." : "0")}
                gradient="from-green-500 to-emerald-500"
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending in Category */}
      <section className="px-6 py-6 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <TrendingUp size={20} className="text-orange-400" />
              <span>Trending in {category.name}</span>
            </h2>
          </motion.div>

          {/* Trending samples from database */}
          <div className="flex space-x-3 overflow-x-auto pb-4 pt-4">
            {trendingSamples.length > 0 ? (
              trendingSamples.map((sample, i) => (
                <TrendingSampleCard
                  key={sample.id}
                  sample={sample}
                  rank={i + 1}
                  maxPlayCount={Math.max(...trendingSamples.map(s => s.playCount))}
                  delay={i * 0.1}
                />
              ))
            ) : (
              // Loading or empty state
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-48 glass rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      {isLoading ? (
                        <div className="w-3 h-3 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <span className="text-white/40 text-sm">—</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "h-3 bg-white/10 rounded mb-1",
                        isLoading && "animate-pulse"
                      )} />
                      <div className={cn(
                        "h-2 bg-white/5 rounded w-16",
                        isLoading && "animate-pulse"
                      )} />
                    </div>
                  </div>
                  <div className="h-6 bg-white/5 rounded" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* All Samples */}
      <section className="px-6 py-8 pb-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              All {category.name} Samples
            </h2>
            <p className="text-white/60">
              Browse through our complete collection of {category.name.toLowerCase()} sounds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SampleGrid
              view={view}
              filters={{
                categoryId: category.id
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-40 right-40 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-40 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
}

function CategoryStat({
  icon,
  label,
  value,
  gradient,
  isLoading
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  isLoading?: boolean;
}) {
  return (
    <div className="glass rounded-lg p-4 flex items-center space-x-3">
      <div className={cn(
        'p-2 rounded-lg bg-gradient-to-br text-white',
        gradient
      )}>
        {icon}
      </div>
      <div>
        <div className={cn(
          "text-lg font-semibold text-white",
          isLoading && "animate-pulse"
        )}>
          {value}
        </div>
        <div className="text-sm text-white/60">{label}</div>
      </div>
    </div>
  );
}

function TrendingSampleCard({
  sample,
  rank,
  // maxPlayCount is available but not used in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maxPlayCount: _maxPlayCount,
  delay
}: {
  sample: {
    id: string;
    name: string;
    fileUrl: string;
    playCount: number;
    library: {
      name: string;
      iconUrl: string | null;
      user: {
        username: string;
        displayName: string | null;
      };
    };
  };
  rank: number;
  maxPlayCount: number;
  delay: number;
}) {
  const { trackPlay } = usePlayTracking();
  
  const {
    play,
    pause,
    isPlaying,
    isLoading,
    currentTime,
    duration
  } = useAudio(
    sample.id,
    sample.fileUrl,
    sample.name,
    {
      onPlay: () => trackPlay(sample.id)
    }
  );

  const handleCardClick = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex-shrink-0 w-48 glass glass-hover rounded-lg p-4 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Play button overlay */}
      <div className="absolute top-3 right-3">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
          isPlaying ? "bg-orange-500" : "bg-white/10 hover:bg-white/20"
        )}>
          {isLoading ? (
            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={12} className="text-white ml-0.5" />
          ) : (
            <Play size={12} className="text-white ml-0.5" />
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <div className="w-4 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
        
        {/* Library icon thumbnail */}
        {sample.library.iconUrl && (
          <div className="flex-shrink-0">
            <Image
              src={sample.library.iconUrl}
              alt={sample.library.name}
              width={24}
              height={24}
              className="w-6 h-6 rounded object-cover bg-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate text-sm">
            {sample.name}
          </div>
          <div className="text-xs text-white/50">
            {sample.playCount} plays
          </div>
        </div>
      </div>
      <div className="text-xs text-white/40 mb-2">
        by {getUserDisplayName(sample.library.user)}
      </div>
      
      {/* Audio Visualizer */}
      <div className="mb-2">
        <AudioVisualizer
          isPlaying={isPlaying}
          duration={duration}
          currentTime={currentTime}
          height={24}
          barCount={12}
          color="rgba(249, 115, 22, 0.6)"
        />
      </div>

      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}