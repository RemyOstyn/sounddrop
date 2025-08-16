'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Music, 
  Users, 
  Calendar, 
  Globe, 
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SampleGrid } from '@/components/audio/sample-grid';
import { ViewToggle, useViewToggle } from '@/components/shared/view-toggle';
import { useFavorites } from '@/hooks/use-favorites';
import { useLibrary } from '@/hooks/use-libraries';
import { getUserDisplayName } from '@/lib/user-display-utils';

interface LibraryDetailClientProps {
  libraryId: string;
}

export function LibraryDetailClient({ libraryId }: LibraryDetailClientProps) {
  const { view, setView } = useViewToggle();
  const { library, isLoading, error } = useLibrary(libraryId);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  // Check if library is public or show error
  const isAccessible = library?.isPublic || false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/60">Loading library...</p>
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Library Not Found</h1>
          <p className="text-white/60 mb-6">
            {error || 'This library doesn\'t exist or may have been removed.'}
          </p>
          <Link href="/libraries">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              Back to Libraries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Lock size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Private Library</h1>
          <p className="text-white/60 mb-6">
            This library is private and not accessible to the public.
          </p>
          <Link href="/libraries">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              Back to Libraries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="px-6 py-4 md:py-8 md:px-8 lg:px-12 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/libraries">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Libraries
                </Button>
              </Link>
            </div>

            {/* Library Info */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Library Icon */}
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {library.iconUrl && !imageError ? (
                  <Image
                    src={library.iconUrl}
                    alt={library.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Music size={48} className="text-purple-400" />
                )}
              </div>

              {/* Library Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {library.name}
                    </h1>
                    
                    {library.description && (
                      <p className="text-lg text-white/70 mb-4 leading-relaxed">
                        {library.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span>by {getUserDisplayName(library.user)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Music size={16} />
                        <span>{library._count.samples} samples</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>Created {new Date(library.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {library.isPublic ? (
                          <>
                            <Globe size={16} className="text-green-400" />
                            <span className="text-green-400">Public</span>
                          </>
                        ) : (
                          <>
                            <Lock size={16} className="text-yellow-400" />
                            <span className="text-yellow-400">Private</span>
                          </>
                        )}
                      </div>
                      
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">
                        {library.category.name}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center space-x-2 ml-4">
                    <ViewToggle view={view} onViewChange={setView} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Samples */}
      <section className="px-6 py-4 pb-24 md:py-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Samples Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Samples ({library._count.samples})
                </h2>
                <p className="text-white/60">
                  Audio samples in this library
                </p>
              </div>
            </div>

            {/* Samples Grid */}
            {library._count.samples > 0 ? (
              <SampleGrid
                view={view}
                filters={{
                  libraryId: library.id
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
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
                  <Music size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No samples yet</h3>
                <p className="text-white/60">
                  This library doesn&apos;t have any samples uploaded yet.
                </p>
              </div>
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