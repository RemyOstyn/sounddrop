'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Grid3X3, List, Search, Settings, Users, Music } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function MyLibrariesPage() {
  const { userName } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: This will be replaced with actual library data in Step 7
  const libraries = [];

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <FolderOpen size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Libraries</h1>
                <p className="text-white/60">
                  {userName}, manage your audio collections
                </p>
              </div>
            </div>

            {/* Create Library Button */}
            <motion.button
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // TODO: Open create library modal in Step 7
                console.log('Open create library modal');
              }}
            >
              <Plus size={18} />
              <span>Create Library</span>
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-white/60">
            <span>{libraries.length} libraries</span>
            <span>•</span>
            <span>0 total samples</span>
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
              placeholder="Search your libraries..."
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
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {libraries.length === 0 ? (
            <EmptyLibraries />
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {/* Libraries will be rendered here */}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EmptyLibraries() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
        <FolderOpen size={32} className="text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">No libraries yet</h3>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        Create your first audio library to organize and share your samples with the community.
        Libraries help you categorize your sounds by theme, genre, or project.
      </p>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Users size={24} className="text-purple-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Share Publicly</h4>
          <p className="text-xs text-white/60">Make your libraries discoverable</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Music size={24} className="text-pink-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Upload Samples</h4>
          <p className="text-xs text-white/60">Add your own audio files</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Settings size={24} className="text-blue-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Customize</h4>
          <p className="text-xs text-white/60">Add icons and descriptions</p>
        </div>
      </div>

      <motion.button
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // TODO: Open create library modal in Step 7
          console.log('Open create library modal');
        }}
      >
        Create Your First Library
      </motion.button>
    </motion.div>
  );
}