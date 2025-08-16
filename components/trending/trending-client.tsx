'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Calendar, Clock } from 'lucide-react';
import { SampleGrid } from '@/components/audio/sample-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { cn } from '@/lib/utils';

type TrendingPeriod = '24h' | '7d' | '30d';

export function TrendingClient() {
  const { view, setView } = useViewToggle();
  const [period, setPeriod] = useState<TrendingPeriod>('24h');

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="px-6 py-4 md:py-8 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-3 rounded-xl gradient-accent">
                <Flame size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Trending
                </h1>
                <p className="text-white/60">
                  The hottest samples right now
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Period Selector */}
      <section className="px-6 py-3 md:py-6 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            {[
              { key: '24h', label: '24 Hours', icon: Clock },
              { key: '7d', label: '7 Days', icon: Calendar },
              { key: '30d', label: '30 Days', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPeriod(key as TrendingPeriod)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                  period === key
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trending Samples */}
      <section className="px-6 py-8 pb-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SampleGrid
              view={view}
              filters={{
                sortBy: 'playCount',
                sortOrder: 'desc'
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-32 right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 left-32 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
}