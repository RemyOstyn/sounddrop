'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Volume2, Users, Library, TrendingUp } from 'lucide-react';
import { SampleGrid } from '@/components/audio/sample-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { LoadingSpinner } from '@/components/shared/skeleton-loader';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { Category } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { view, setView } = useViewToggle();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use()
  const resolvedParams = use(params);

  // Find category from constants (in real app, this would be from API)
  useEffect(() => {
    const foundCategory = DEFAULT_CATEGORIES.find(cat => cat.slug === resolvedParams.slug);
    
    if (foundCategory) {
      setCategory({
        id: foundCategory.slug,
        name: foundCategory.name,
        slug: foundCategory.slug,
        icon: foundCategory.icon,
        description: `Discover amazing ${foundCategory.name.toLowerCase()} samples`,
        order: 0,
        createdAt: new Date()
      });
    } else {
      setError('Category not found');
    }
    
    setIsLoading(false);
  }, [resolvedParams.slug]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !category) {
    notFound();
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
                value="1,247"
                gradient="from-purple-500 to-pink-500"
              />
              <CategoryStat
                icon={<Library size={16} />}
                label="Libraries"
                value="89"
                gradient="from-blue-500 to-cyan-500"
              />
              <CategoryStat
                icon={<Users size={16} />}
                label="Contributors"
                value="234"
                gradient="from-green-500 to-emerald-500"
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

          {/* Quick trending preview - would be actual trending samples */}
          <div className="flex space-x-3 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-48 glass glass-hover rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate text-sm">
                      Sample {i}
                    </div>
                    <div className="text-xs text-white/50">
                      {Math.floor(Math.random() * 1000)} plays
                    </div>
                  </div>
                </div>
                <div className="h-6 bg-white/5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary opacity-60"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                </div>
              </motion.div>
            ))}
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
  gradient
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
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
        <div className="text-lg font-semibold text-white">{value}</div>
        <div className="text-sm text-white/60">{label}</div>
      </div>
    </div>
  );
}