'use client';

import { useState } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { Music, TrendingUp, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { SampleGrid, CompactSampleGrid } from '@/components/audio/sample-grid'; // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: CompactSampleGrid will be used for featured sections
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { GridSkeleton } from '@/components/shared/skeleton-loader'; // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: GridSkeleton will be used for loading states
import { useStats } from '@/hooks/use-stats';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';
import type { TabId, TabNavigationProps } from '@/types/ui';

export default function HomePage() {
  const { view, setView } = useViewToggle();
  const [activeTab, setActiveTab] = useState<TabId>('trending');
  const { stats, isLoading: isStatsLoading } = useStats();
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="min-h-full bg-gradient-to-br from-transparent via-purple-900/5 to-pink-900/5">
      {/* Hero Section */}
      <section className="relative px-6 py-6 md:py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-12"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image 
                  src="/logo.webp" 
                  alt="SoundDrop Logo" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gradient">
                SoundDrop
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
              The pocket soundboard for every moment. 
              <br className="hidden md:block" />
              Discover, play, and share amazing audio samples.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 md:mb-12"
          >
            {/* Mobile Stats - Single Row */}
            <div className="md:hidden">
              <MobileStatsRow
                stats={stats}
                isLoading={isStatsLoading}
              />
            </div>
            
            {/* Desktop Stats - Grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
              <StatCard
                icon={<Music size={20} />}
                label="Total Samples"
                value={stats?.totalSamples || (isStatsLoading ? "..." : "0")}
                gradient="from-purple-500 to-pink-500"
                isLoading={isStatsLoading}
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Libraries"
                value={stats?.totalLibraries || (isStatsLoading ? "..." : "0")}
                gradient="from-orange-500 to-red-500"
                isLoading={isStatsLoading}
              />
              <StatCard
                icon={<Clock size={20} />}
                label="Recent"
                value={stats?.recentSamples || (isStatsLoading ? "..." : "0")}
                gradient="from-blue-500 to-cyan-500"
                isLoading={isStatsLoading}
              />
              <StatCard
                icon={<Users size={20} />}
                label="Users"
                value={stats?.totalUsers || (isStatsLoading ? "..." : "0")}
                gradient="from-green-500 to-emerald-500"
                isLoading={isStatsLoading}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Content Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Explore Samples
              </h2>
              <p className="text-white/60">
                Discover the most popular audio samples from our community
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4 md:mb-8"
          >
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { id: 'all' as const, label: 'All Samples', icon: <Music size={16} /> },
                { id: 'trending' as const, label: 'Trending', icon: <TrendingUp size={16} /> },
                { id: 'recent' as const, label: 'Recent', icon: <Clock size={16} /> }
              ]}
            />
          </motion.div>

          {/* Sample Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SampleGrid
              view={view}
              filters={{
                ...(activeTab === 'trending' && { sortBy: 'playCount' as const }),
                ...(activeTab === 'recent' && { sortBy: 'createdAt' as const })
              }}
              onSampleFavorite={async (sampleId: string) => {
                try {
                  await toggleFavorite(sampleId);
                } catch (error) {
                  console.error('Failed to toggle favorite:', error);
                }
              }}
              getUserFavorites={(sampleIds: string[]) => {
                const favorites: Record<string, boolean> = {};
                sampleIds.forEach(id => {
                  favorites[id] = isFavorite(id);
                });
                return favorites;
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse transform -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse transform translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}

function StatCard({
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
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass glass-hover rounded-xl p-4 relative overflow-hidden"
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-10',
        gradient
      )} />
      
      <div className="relative z-10 flex items-center space-x-3">
        <div className={cn(
          'p-2 rounded-lg bg-gradient-to-br text-white',
          gradient
        )}>
          {icon}
        </div>
        <div>
          <div className={cn(
            "text-lg font-bold text-white",
            isLoading && "animate-pulse"
          )}>
            {value}
          </div>
          <div className="text-xs text-white/60">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function MobileStatsRow({
  stats,
  isLoading
}: {
  stats: {
    totalSamples?: string;
    totalLibraries?: string;
    recentSamples?: string;
    totalUsers?: string;
  } | null;
  isLoading: boolean;
}) {
  const statItems = [
    { icon: <Music size={16} />, value: stats?.totalSamples || (isLoading ? "..." : "0"), label: "Samples" },
    { icon: <TrendingUp size={16} />, value: stats?.totalLibraries || (isLoading ? "..." : "0"), label: "Libraries" },
    { icon: <Clock size={16} />, value: stats?.recentSamples || (isLoading ? "..." : "0"), label: "Recent" },
    { icon: <Users size={16} />, value: stats?.totalUsers || (isLoading ? "..." : "0"), label: "Users" }
  ];

  return (
    <div className="glass rounded-lg p-1.5">
      <div className="grid grid-cols-4 gap-0.5">
        {statItems.map((item, index) => (
          <div key={index} className="text-center py-1">
            <div className="flex justify-center mb-0.5">
              <div className="text-white/70">{React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 12 })}</div>
            </div>
            <div className={cn(
              "text-xs font-bold text-white leading-none",
              isLoading && "animate-pulse"
            )}>
              {item.value}
            </div>
            <div className="text-[10px] text-white/60 leading-none mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabNavigation({
  activeTab,
  onTabChange,
  tabs
}: TabNavigationProps) {
  return (
    <div className="flex space-x-1 glass rounded-lg p-1 w-fit">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative flex items-center px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium',
            activeTab === tab.id
              ? 'text-white'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          )}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/10 rounded-md"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            {tab.icon}
            <span>{tab.label}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}