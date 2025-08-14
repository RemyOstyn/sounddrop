'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Grid3X3, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLibraries } from '@/hooks/use-libraries';
import { LibraryGrid } from '@/components/library/library-grid';
import { CreateLibraryDialog } from '@/components/library/create-library-dialog';
import { EditLibraryDialog } from '@/components/library/edit-library-dialog';
import { DeleteLibraryDialog } from '@/components/library/delete-library-dialog';
import { LibraryWithDetails, Category } from '@/types/database';
import { ViewToggle } from '@/components/shared/view-toggle';
import { toast } from 'sonner';

export default function MyLibrariesPage() {
  const { userName, user } = useAuth();
  const { libraries, isLoading, error, fetchLibraries, refreshLibraries } = useLibraries();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryWithDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter libraries to show only user's own libraries
  const userLibraries = useMemo(() => {
    if (!user) return [];
    return libraries.filter(library => library.userId === user.id);
  }, [libraries, user]);

  // Filter libraries based on search query
  const filteredLibraries = useMemo(() => {
    if (!searchQuery.trim()) return userLibraries;
    
    const query = searchQuery.toLowerCase();
    return userLibraries.filter(library => 
      library.name.toLowerCase().includes(query) ||
      library.description?.toLowerCase().includes(query) ||
      library.category.name.toLowerCase().includes(query)
    );
  }, [userLibraries, searchQuery]);

  // Fetch user's libraries on mount (only when user is available)
  // Note: In development, React.StrictMode may cause this to run twice - this is expected behavior
  useEffect(() => {
    if (user) {
      fetchLibraries({ userId: user.id });
    }
  }, [user, fetchLibraries]); // Include fetchLibraries in dependency array per ESLint rule

  // Fetch categories for create/edit dialogs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLibraryClick = (library: LibraryWithDetails) => {
    // Navigate to library detail page
    window.location.href = `/library/${library.id}`;
  };

  const handleEditLibrary = (library: LibraryWithDetails) => {
    setSelectedLibrary(library);
    setShowEditDialog(true);
  };

  const handleDeleteLibrary = (library: LibraryWithDetails) => {
    setSelectedLibrary(library);
    setShowDeleteDialog(true);
  };

  const handleUploadToLibrary = (library: LibraryWithDetails) => {
    // Navigate to upload page with library pre-selected
    const url = new URL('/upload', window.location.origin);
    url.searchParams.set('library', library.id);
    window.location.href = url.toString();
  };

  const handleCreateSuccess = () => {
    toast.success('Library created successfully');
    refreshLibraries();
  };

  const handleEditSuccess = () => {
    toast.success('Library updated successfully');
    refreshLibraries();
  };

  const handleDeleteSuccess = () => {
    toast.success('Library deleted successfully');
    refreshLibraries();
  };

  const totalSamples = userLibraries.reduce((sum, lib) => sum + lib._count.samples, 0);

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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus size={18} className="mr-2" />
                Create Library
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-white/60">
            <span>{userLibraries.length} libraries</span>
            <span>•</span>
            <span>{totalSamples} total samples</span>
            {searchQuery && (
              <>
                <span>•</span>
                <span>{filteredLibraries.length} matching</span>
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
              placeholder="Search your libraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <ViewToggle
            view={viewMode}
            onViewChange={setViewMode}
          />
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
              <Button
                onClick={refreshLibraries}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && userLibraries.length === 0 && (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-white/60">Loading your libraries...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && userLibraries.length === 0 && (
            <EmptyLibraries onCreateClick={() => setShowCreateDialog(true)} />
          )}

          {/* Search Empty State */}
          {!isLoading && !error && userLibraries.length > 0 && filteredLibraries.length === 0 && searchQuery && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
              <p className="text-white/60 mb-4">
                No libraries match &quot;{searchQuery}&quot;. Try a different search term.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          )}

          {/* Libraries Grid/List */}
          {!error && filteredLibraries.length > 0 && (
            <LibraryGrid
              libraries={filteredLibraries}
              view={viewMode}
              showActions={true}
              onLibraryClick={handleLibraryClick}
              onLibraryEdit={handleEditLibrary}
              onLibraryDelete={handleDeleteLibrary}
              onLibraryUpload={handleUploadToLibrary}
            />
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <CreateLibraryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        categories={categories}
        onSuccess={handleCreateSuccess}
      />

      <EditLibraryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        library={selectedLibrary}
        categories={categories}
        onSuccess={handleEditSuccess}
      />

      <DeleteLibraryDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        library={selectedLibrary}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

function EmptyLibraries({ onCreateClick }: { onCreateClick: () => void }) {
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
          <FolderOpen size={24} className="text-purple-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Share Publicly</h4>
          <p className="text-xs text-white/60">Make your libraries discoverable</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Plus size={24} className="text-pink-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Upload Samples</h4>
          <p className="text-xs text-white/60">Add your own audio files</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <Grid3X3 size={24} className="text-blue-400 mx-auto mb-2" />
          <h4 className="font-medium text-white mb-1">Customize</h4>
          <p className="text-xs text-white/60">Add icons and descriptions</p>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
          onClick={onCreateClick}
        >
          Create Your First Library
        </Button>
      </motion.div>
    </motion.div>
  );
}