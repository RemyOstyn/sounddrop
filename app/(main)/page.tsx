'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, TrendingUp, Clock, Users } from 'lucide-react';
import { SampleGrid, CompactSampleGrid } from '@/components/audio/sample-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { GridSkeleton } from '@/components/shared/skeleton-loader';
import { cn } from '@/lib/utils';
import type { TabId, TabNavigationProps } from '@/types/ui';

export default function HomePage() {
  const { view, setView } = useViewToggle();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  return (
    <div className="min-h-full bg-gradient-to-br from-transparent via-purple-900/5 to-pink-900/5">
      {/* Hero Section */}
      <section className="relative px-6 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
              SoundDrop
            </h1>
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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
            <StatCard
              icon={<Music size={20} />}
              label="Total Samples"
              value="12.5K"
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Trending"
              value="847"
              gradient="from-orange-500 to-red-500"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Recent"
              value="156"
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Users size={20} />}
              label="Active Users"
              value="3.2K"
              gradient="from-green-500 to-emerald-500"
            />
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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
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
            className="mb-8"
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
  gradient
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
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
          <div className="text-lg font-bold text-white">{value}</div>
          <div className="text-xs text-white/60">{label}</div>
        </div>
      </div>
    </motion.div>
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
            'relative flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium',
            activeTab === tab.id
              ? 'text-white bg-white/10'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          )}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/10 rounded-md"
              initial={false}
              transition={{ duration: 0.2 }}
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