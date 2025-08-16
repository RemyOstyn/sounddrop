'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { LibraryWithDetails } from '@/types/database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LibrarySelectorProps {
  libraries: LibraryWithDetails[];
  selectedLibrary?: string;
  onLibrarySelect: (libraryId: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}

// Simple media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function LibrarySelector({
  libraries,
  selectedLibrary,
  onLibrarySelect,
  onCreateNew,
  disabled = false
}: LibrarySelectorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileLibrarySelector
        libraries={libraries}
        selectedLibrary={selectedLibrary}
        onLibrarySelect={onLibrarySelect}
        onCreateNew={onCreateNew}
        disabled={disabled}
      />
    );
  }

  return (
    <DesktopLibrarySelector
      libraries={libraries}
      selectedLibrary={selectedLibrary}
      onLibrarySelect={onLibrarySelect}
      onCreateNew={onCreateNew}
      disabled={disabled}
    />
  );
}

function DesktopLibrarySelector({
  libraries,
  selectedLibrary,
  onLibrarySelect,
  onCreateNew,
  disabled
}: LibrarySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Select Library</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateNew}
          disabled={disabled}
          className="text-sm"
        >
          <Plus size={16} className="mr-2" />
          Create New
        </Button>
      </div>

      {libraries.length > 0 ? (
        <Select value={selectedLibrary} onValueChange={onLibrarySelect} disabled={disabled}>
          <SelectTrigger className="bg-white/5 border-white/20">
            <SelectValue placeholder="Choose a library for your samples" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map((library) => (
              <SelectItem key={library.id} value={library.id}>
                <div className="flex items-center space-x-2">
                  {library.iconUrl && (
                    <Image
                      src={library.iconUrl}
                      alt={library.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span>{library.name}</span>
                  <span className="text-xs text-white/60">
                    ({library._count.samples} samples)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
          <FolderOpen size={32} className="mx-auto text-white/60 mb-4" />
          <p className="text-white/80 mb-2">No libraries found</p>
          <p className="text-white/60 text-sm mb-4">
            Create your first library to organize your samples
          </p>
          <Button
            variant="outline"
            onClick={onCreateNew}
            disabled={disabled}
          >
            <Plus size={16} className="mr-2" />
            Create Library
          </Button>
        </div>
      )}
    </div>
  );
}

function MobileLibrarySelector({
  libraries,
  selectedLibrary,
  onLibrarySelect,
  onCreateNew,
  disabled
}: LibrarySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Select Library</h3>
      
      {/* Create New Library Card - Always at top */}
      <motion.button
        onClick={onCreateNew}
        disabled={disabled}
        className={cn(
          'w-full p-4 rounded-xl border-2 border-dashed transition-all',
          'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Plus size={20} className="text-purple-400" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-medium text-white">Create New Library</h4>
            <p className="text-sm text-white/60">Set up a new collection</p>
          </div>
          <ChevronDown size={16} className="text-white/60" />
        </div>
      </motion.button>

      {/* Existing Libraries */}
      {libraries.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-white/60">Or choose an existing library:</p>
          <div className="space-y-2">
            {libraries.map((library) => (
              <motion.button
                key={library.id}
                onClick={() => onLibrarySelect(library.id)}
                disabled={disabled}
                className={cn(
                  'w-full p-4 rounded-xl border transition-all',
                  selectedLibrary === library.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                    {library.iconUrl ? (
                      <Image
                        src={library.iconUrl}
                        alt={library.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderOpen size={20} className="text-white/60" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-medium text-white">{library.name}</h4>
                    <p className="text-sm text-white/60">
                      {library._count.samples} samples • {library.category.name}
                    </p>
                  </div>
                  {selectedLibrary === library.id && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}