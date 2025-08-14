'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthLoadingProps {
  className?: string;
  variant?: 'skeleton' | 'spinner' | 'pulse';
}

export function AuthLoading({ className, variant = 'skeleton' }: AuthLoadingProps) {
  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn('w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full', className)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // Default skeleton variant
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Avatar skeleton */}
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Text skeleton */}
      <div className="hidden md:block space-y-1">
        <motion.div
          className="h-3 w-20 bg-gradient-to-r from-white/10 to-white/20 rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
        <motion.div
          className="h-2 w-16 bg-gradient-to-r from-white/5 to-white/15 rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        />
      </div>

      {/* Chevron skeleton */}
      <motion.div
        className="w-4 h-4 bg-gradient-to-br from-white/10 to-white/20 rounded"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.6,
        }}
      />
    </div>
  );
}

// Full page loading component for auth initialization
export function AuthPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-white">Initializing...</h3>
          <p className="text-sm text-white/60">Setting up your authentication</p>
        </motion.div>
      </div>
    </div>
  );
}