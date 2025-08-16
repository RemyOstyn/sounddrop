'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Calendar, Clock } from 'lucide-react';
import { SampleGrid } from '@/components/audio/sample-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { cn } from '@/lib/utils';

type TrendingPeriod = '24h' | '7d' | '30d';

export default function TrendingPage() {
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
          >
            <PeriodSelector
              activePeriod={period}
              onPeriodChange={setPeriod}
            />
          </motion.div>
        </div>
      </section>

      {/* Trending Samples */}
      <section className="px-6 py-4 pb-24 md:py-8 md:px-8 lg:px-12">
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
              key={period} // Force re-render when period changes
            />
          </motion.div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
}

function PeriodSelector({
  activePeriod,
  onPeriodChange
}: {
  activePeriod: TrendingPeriod;
  onPeriodChange: (period: TrendingPeriod) => void;
}) {
  const periods = [
    { 
      id: '24h' as const, 
      label: 'Last 24 Hours', 
      icon: <Clock size={16} />,
      description: 'What\'s hot right now'
    },
    { 
      id: '7d' as const, 
      label: 'This Week', 
      icon: <Calendar size={16} />,
      description: 'Popular this week'
    },
    { 
      id: '30d' as const, 
      label: 'This Month', 
      icon: <TrendingUp size={16} />,
      description: 'Monthly favorites'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white/80">Time Period</h2>
      
      <div className="flex flex-wrap gap-3">
        {periods.map((period) => (
          <motion.button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={cn(
              'relative glass glass-hover rounded-lg p-3 md:p-4 text-left transition-all duration-200',
              'min-w-[160px] md:min-w-[200px] flex-1',
              activePeriod === period.id
                ? 'bg-white/10 border-white/20'
                : 'border-white/5'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activePeriod === period.id && (
              <div className="absolute inset-0 bg-gradient-accent opacity-10 rounded-lg" />
            )}
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg transition-colors duration-200',
                  activePeriod === period.id
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-white/10 text-white/60'
                )}>
                  {period.icon}
                </div>
                <div>
                  <div className={cn(
                    'font-medium transition-colors duration-200',
                    activePeriod === period.id ? 'text-white' : 'text-white/80'
                  )}>
                    {period.label}
                  </div>
                  <div className="text-sm text-white/50">
                    {period.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {activePeriod === period.id && (
              <motion.div
                layoutId="selectedPeriod"
                className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full"
                initial={false}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}