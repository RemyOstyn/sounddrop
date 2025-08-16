'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Search, Layers, Users, Music } from 'lucide-react';
import { useLibraries } from '@/hooks/use-libraries';
import { LibraryGrid } from '@/components/library/library-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { useCategories } from '@/hooks/use-categories';
import { LibraryWithDetails, Category } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'recent' | 'popular' | 'alphabetical';

export function LibrariesClient() {
  const { view, setView } = useViewToggle();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  
  const { libraries, isLoading, error, fetchLibraries } = useLibraries();
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  // Load public libraries on mount
  React.useEffect(() => {
    fetchLibraries({
      limit: 50 // Show more libraries on public page
    });
  }, [fetchLibraries]);

  // Filter and sort libraries
  const filteredLibraries = useMemo(() => {
    let result = libraries.filter(library => library.isPublic);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(library => 
        library.name.toLowerCase().includes(query) ||
        library.description?.toLowerCase().includes(query) ||
        library.category.name.toLowerCase().includes(query) ||
        library.user.username?.toLowerCase().includes(query) ||
        library.user.displayName?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(library => library.categoryId === selectedCategory);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b._count.samples - a._count.samples);
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return result;
  }, [libraries, searchQuery, selectedCategory, sortBy]);

  const handleLibraryClick = (library: LibraryWithDetails) => {
    window.location.href = `/libraries/${library.id}`;
  };

  const stats = useMemo(() => {
    const publicLibraries = libraries.filter(lib => lib.isPublic);
    return {
      totalLibraries: publicLibraries.length,
      totalSamples: publicLibraries.reduce((sum, lib) => sum + lib._count.samples, 0),
      totalCreators: new Set(publicLibraries.map(lib => lib.userId)).size
    };
  }, [libraries]);

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
              <div className="p-3 rounded-xl gradient-primary">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Community Libraries
                </h1>
                <p className="text-white/60">
                  Discover amazing audio collections from creators
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mt-6"
          >
            <StatCard
              icon={<Layers size={16} />}
              label="Libraries"
              value={stats.totalLibraries.toString()}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<Music size={16} />}
              label="Samples"
              value={stats.totalSamples.toString()}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Users size={16} />}
              label="Creators"
              value={stats.totalCreators.toString()}
              gradient="from-green-500 to-emerald-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 py-3 md:py-6 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search libraries, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isCategoriesLoading}
              >
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 focus:ring-purple-500/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-white/20 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 focus:ring-purple-500/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-white/20 text-white">
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Recently Created</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center space-x-4 text-sm text-white/60">
              <span>{filteredLibraries.length} libraries found</span>
              {searchQuery && (
                <>
                  <span>•</span>
                  <span>Searching for &quot;{searchQuery}&quot;</span>
                </>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <>
                  <span>•</span>
                  <span>In {categories.find(c => c.id === selectedCategory)?.name}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Libraries Grid */}
      <section className="px-6 py-4 pb-24 md:py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
                <p className="text-white/60">Loading libraries...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
                  {error}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredLibraries.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
                  <FolderOpen size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery || (selectedCategory && selectedCategory !== 'all') ? 'No libraries found' : 'No public libraries yet'}
                </h3>
                <p className="text-white/60">
                  {searchQuery || (selectedCategory && selectedCategory !== 'all')
                    ? 'Try adjusting your search or filters.'
                    : 'Be the first to create a public library!'
                  }
                </p>
              </div>
            )}

            {/* Libraries Grid */}
            {!error && filteredLibraries.length > 0 && (
              <LibraryGrid
                libraries={filteredLibraries}
                view={view}
                showActions={false}
                showCreator={true}
                onLibraryClick={handleLibraryClick}
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
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
          <div className="text-lg font-bold text-white">
            {value}
          </div>
          <div className="text-xs text-white/60">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}