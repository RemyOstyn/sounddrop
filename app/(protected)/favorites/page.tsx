'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Grid3X3, List, Search, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { SampleCard } from '@/components/audio/sample-card';

export default function FavoritesPage() {
  const { userName } = useAuth();
  const { favorites, isLoading, error, refetch, hasMore, loadMore, removeFavorite } = useFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter favorites based on search query
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    
    const query = searchQuery.toLowerCase();
    return favorites.filter(favorite => 
      favorite.sample.name.toLowerCase().includes(query) ||
      favorite.sample.library.name.toLowerCase().includes(query) ||
      favorite.sample.library.user.name?.toLowerCase().includes(query) ||
      favorite.sample.library.category.name.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

  const handleFavoriteRemove = async (favoriteId: string) => {
    try {
      await removeFavorite(favoriteId);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
              <Heart size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
              <p className="text-white/60">
                {userName}, discover your saved audio samples
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-white/60">
            <span>{favorites.length} favorites</span>
            {searchQuery && (
              <>
                <span>•</span>
                <span>{filteredFavorites.length} matching</span>
              </>
            )}
            <span>•</span>
            <span>Last updated just now</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Filter Button */}
          <button className="flex items-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
                {error}
              </div>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && favorites.length === 0 && (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-white/60">Loading your favorites...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && favorites.length === 0 && (
            <EmptyFavorites />
          )}

          {/* Favorites Grid/List */}
          {!error && favorites.length > 0 && (
            <>
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
                  <p className="text-white/60 mb-4">
                    No favorites match &quot;{searchQuery}&quot;. Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                    {filteredFavorites.map((favorite, index) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SampleCard
                          sample={{
                            ...favorite.sample,
                            favorites: [favorite],
                            _count: { favorites: 1 }
                          }}
                          view={viewMode}
                          showPlayCount={true}
                          showFavoriteCount={true}
                          isUserFavorited={true}
                          onFavoriteToggle={() => handleFavoriteRemove(favorite.id)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white transition-colors flex items-center space-x-2 mx-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Load More</span>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EmptyFavorites() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full flex items-center justify-center">
        <Heart size={32} className="text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">No favorites yet</h3>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        Start exploring audio samples and tap the heart icon to add them to your favorites.
        Your saved samples will appear here.
      </p>
      <motion.button
        onClick={() => window.location.href = '/'}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Browse Samples
      </motion.button>
    </motion.div>
  );
}