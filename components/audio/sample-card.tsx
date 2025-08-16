'use client';

import { motion } from 'framer-motion';
import { Heart, MoreVertical, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { PlayButton, CompactPlayButton } from './play-button';
import { AudioVisualizer, MiniVisualizer } from './audio-visualizer';
import { useAudio, usePlayTracking } from '@/hooks/use-audio';
import { SampleWithDetails } from '@/types/database';
import { cn } from '@/lib/utils';
import { getUserDisplayName } from '@/lib/user-display-utils';

interface SampleCardProps {
  sample: SampleWithDetails;
  view?: 'grid' | 'list';
  showPlayCount?: boolean;
  showFavoriteCount?: boolean;
  isUserFavorited?: boolean;
  onFavoriteToggle?: (sampleId: string, isFavorited: boolean) => void;
  className?: string;
}

export function SampleCard({
  sample,
  view = 'grid',
  showPlayCount = true,
  showFavoriteCount = true,
  isUserFavorited = false,
  onFavoriteToggle,
  className
}: SampleCardProps) {
  const { trackPlay } = usePlayTracking();
  
  const {
    play,
    pause,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    formattedDuration
  } = useAudio(
    sample.id,
    sample.fileUrl,
    sample.name,
    {
      onPlay: () => trackPlay(sample.id)
    }
  );

  const handleFavoriteToggle = () => {
    onFavoriteToggle?.(sample.id, !isUserFavorited);
  };

  const handleCardClick = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  if (view === 'list') {
    return <ListSampleCard {...{
      sample,
      play,
      pause,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      formattedDuration,
      showPlayCount,
      showFavoriteCount,
      isUserFavorited,
      handleFavoriteToggle,
      handleCardClick,
      className
    }} />;
  }

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-xl glass glass-hover cursor-pointer',
        'p-4 h-48 flex flex-col justify-between',
        className
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top section */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          {/* Library icon thumbnail */}
          {sample.library.iconUrl && (
            <div className="flex-shrink-0">
              <Image
                src={sample.library.iconUrl}
                alt={sample.library.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-md object-cover bg-white/10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate mb-1">
              {sample.name}
            </h3>
            <p className="text-xs text-white/60 truncate">
              {getUserDisplayName(sample.library.user)} • {sample.library.name}
            </p>
            {sample.library.category && (
              <p className="text-xs text-white/40 truncate mt-0.5">
                {sample.library.category.name}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement more options menu
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 transition-all duration-200"
        >
          <MoreVertical size={14} className="text-white/60" />
        </button>
      </div>

      {/* Visualizer */}
      <div className="relative z-10 my-3">
        <AudioVisualizer
          isPlaying={isPlaying}
          duration={duration}
          currentTime={currentTime}
          height={32}
          barCount={20}
          color="rgba(139, 92, 246, 0.6)"
        />
      </div>

      {/* Bottom section */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PlayButton
            isPlaying={isPlaying}
            isLoading={isLoading}
            hasError={!!error}
            onPlay={play}
            onPause={pause}
            size="md"
            variant="secondary"
          />
          
          <div className="text-xs text-white/60">
            {formattedDuration}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showPlayCount && (
            <div className="flex items-center space-x-1 text-xs text-white/60">
              <TrendingUp size={12} />
              <span>{sample.playCount}</span>
            </div>
          )}

          {showFavoriteCount && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteToggle();
              }}
              className={cn(
                'flex items-center space-x-1 p-1.5 rounded-md transition-all duration-200',
                isUserFavorited 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart 
                size={12} 
                fill={isUserFavorited ? 'currentColor' : 'none'}
              />
              <span className="text-xs">{sample._count.favorites}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Trending badge */}
      {sample.playCount > 100 && (
        <div className="absolute top-2 right-2 bg-gradient-accent px-2 py-0.5 rounded-full text-xs font-medium text-white">
          🔥 Trending
        </div>
      )}
    </motion.div>
  );
}

function ListSampleCard({
  sample,
  play,
  pause,
  isPlaying,
  isLoading,
  error,
  currentTime, // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Will be used for progress tracking in audio visualizer
  duration, // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Will be used for progress calculation and display
  formattedDuration,
  showPlayCount,
  showFavoriteCount,
  isUserFavorited,
  handleFavoriteToggle,
  handleCardClick,
  className
}: {
  sample: SampleWithDetails;
  play: () => Promise<void>;
  pause: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  error?: string;
  currentTime: number;
  duration: number;
  formattedDuration: string;
  showPlayCount: boolean;
  showFavoriteCount: boolean;
  isUserFavorited: boolean;
  handleFavoriteToggle: () => void;
  handleCardClick: () => void;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-lg glass glass-hover cursor-pointer',
        'p-3 flex items-center space-x-3 min-h-[60px]',
        className
      )}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Play button */}
      <CompactPlayButton
        isPlaying={isPlaying}
        isLoading={isLoading}
        hasError={!!error}
        onPlay={play}
        onPause={pause}
      />

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

      {/* Mini visualizer */}
      <div className="flex-shrink-0">
        <MiniVisualizer
          isPlaying={isPlaying}
          barCount={4}
          color="rgba(139, 92, 246, 0.8)"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-white text-sm truncate">
              {sample.name}
            </h3>
            <p className="text-xs text-white/60 truncate">
              {getUserDisplayName(sample.library.user)} • {sample.library.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-white/60">
            <span>{formattedDuration}</span>
            
            {showPlayCount && (
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>{sample.playCount}</span>
              </div>
            )}
            
            {showFavoriteCount && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle();
                }}
                className={cn(
                  'flex items-center space-x-1 p-1 rounded-md transition-all duration-200',
                  isUserFavorited 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart 
                  size={12} 
                  fill={isUserFavorited ? 'currentColor' : 'none'}
                />
                <span>{sample._count.favorites}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}

// Skeleton loader for sample cards
export function SampleCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="glass rounded-lg p-3 flex items-center space-x-3 min-h-[60px]">
        <div className="w-8 h-8 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded skeleton" />
          <div className="h-3 bg-white/5 rounded skeleton w-2/3" />
        </div>
        <div className="w-16 h-3 bg-white/5 rounded skeleton" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 h-48 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded skeleton" />
        <div className="h-3 bg-white/5 rounded skeleton w-2/3" />
        <div className="h-3 bg-white/5 rounded skeleton w-1/2" />
      </div>
      
      <div className="h-8 bg-white/5 rounded skeleton my-3" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full skeleton bg-white/10" />
          <div className="w-8 h-3 skeleton bg-white/5" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-3 skeleton bg-white/5" />
          <div className="w-6 h-3 skeleton bg-white/5" />
        </div>
      </div>
    </div>
  );
}