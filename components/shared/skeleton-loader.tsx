'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <motion.div
      className={cn('skeleton rounded', className)}
      animate={animate ? {
        opacity: [0.5, 0.8, 0.5]
      } : undefined}
      transition={animate ? {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      } : undefined}
    />
  );
}

// Card skeletons
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-xl p-4 space-y-4', className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-full" />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-6" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-lg p-3 flex items-center space-x-3', className)}>
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-shrink-0">
        <div className="flex space-x-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-1 h-4" />
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center space-x-4 text-xs">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-6" />
        <Skeleton className="h-3 w-6" />
      </div>
    </div>
  );
}

// Navigation skeletons
export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass w-64 h-full p-4 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Search */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Navigation items */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 ml-4">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileNavSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-2xl p-2 flex items-center justify-around', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-1">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="w-8 h-2" />
        </div>
      ))}
    </div>
  );
}

// Content skeletons
export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-lg p-4 space-y-3', className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

// Grid skeletons
export function GridSkeleton({ 
  count = 12, 
  view = 'grid',
  className 
}: { 
  count?: number;
  view?: 'grid' | 'list';
  className?: string;
}) {
  const gridClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
    list: 'flex flex-col space-y-3'
  };

  return (
    <div className={cn(gridClasses[view], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          {view === 'grid' ? (
            <CardSkeleton className="h-48" />
          ) : (
            <ListItemSkeleton />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Loading states
export function LoadingSpinner({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-purple-400 border-t-transparent rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Pulse animation for loading states
export function PulseLoader({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-white/5 rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  );
}