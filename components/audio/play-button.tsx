'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasError?: boolean;
  onPlay: () => void;
  onPause: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  showPulse?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
};

export function PlayButton({
  isPlaying,
  isLoading,
  hasError = false,
  onPlay,
  onPause,
  size = 'md',
  variant = 'primary',
  className,
  disabled = false,
  showPulse = true
}: PlayButtonProps) {
  const handleClick = () => {
    if (disabled || isLoading) return;
    
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'gradient-primary text-white shadow-lg';
      case 'secondary':
        return 'glass glass-hover border-white/20 text-white';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 text-white/70 hover:text-white';
      default:
        return 'gradient-primary text-white shadow-lg';
    }
  };

  const iconSize = iconSizes[size];

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
        sizeClasses[size],
        getVariantClasses(),
        {
          'cursor-not-allowed opacity-50': disabled,
          'hover:scale-105 active:scale-95': !disabled && !isLoading,
          'animate-pulse': isLoading,
        },
        className
      )}
      whileHover={!disabled && !isLoading ? { scale: 1.05 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : undefined}
    >
      {/* Pulse effect when playing */}
      <AnimatePresence>
        {isPlaying && showPulse && variant === 'primary' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/30"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ 
              scale: [1, 1.5, 2], 
              opacity: [0.8, 0.3, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        )}
      </AnimatePresence>

      {/* Inner glow when playing */}
      {isPlaying && variant === 'primary' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse" />
      )}

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={iconSize} className="animate-spin" />
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={iconSize} className="text-red-400" />
            </motion.div>
          ) : isPlaying ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Pause size={iconSize} fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ marginLeft: '1px' }} // Optical alignment for play icon
            >
              <Play size={iconSize} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ripple effect */}
      {!disabled && !isLoading && (
        <span className="absolute inset-0 rounded-full">
          <span className="ripple rounded-full" />
        </span>
      )}
    </motion.button>
  );
}

// Compact play button for list views
export function CompactPlayButton({
  isPlaying,
  isLoading,
  hasError,
  onPlay,
  onPause,
  className
}: Omit<PlayButtonProps, 'size' | 'variant'>) {
  return (
    <PlayButton
      isPlaying={isPlaying}
      isLoading={isLoading}
      hasError={hasError}
      onPlay={onPlay}
      onPause={onPause}
      size="sm"
      variant="ghost"
      showPulse={false}
      className={cn('hover:bg-white/20', className)}
    />
  );
}

// Large play button for hero sections
export function HeroPlayButton({
  isPlaying,
  isLoading,
  hasError,
  onPlay,
  onPause,
  className
}: Omit<PlayButtonProps, 'size' | 'variant'>) {
  return (
    <PlayButton
      isPlaying={isPlaying}
      isLoading={isLoading}
      hasError={hasError}
      onPlay={onPlay}
      onPause={onPause}
      size="xl"
      variant="primary"
      className={cn('shadow-2xl shadow-purple-500/25', className)}
    />
  );
}