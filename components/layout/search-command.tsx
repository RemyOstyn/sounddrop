'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Search,
  Clock,
  TrendingUp,
  Music,
  Folder,
  User,
  PlayCircle,
  Pause,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import { useAudio, usePlayTracking } from '@/hooks/use-audio';
import { getUserDisplayName } from '@/lib/user-display-utils';
import type { SearchApiResponse, SearchSample, SearchLibrary, SearchUser } from '@/types/search';

interface SearchResult {
  id: string;
  type: 'sample' | 'library' | 'user' | 'category';
  title: string;
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode;
  // Sample-specific data for audio playback
  fileUrl?: string;
  sampleData?: SearchSample;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sounddrop-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data: SearchApiResponse = await response.json();
      
      // Transform API response to SearchResult format
      const searchResults: SearchResult[] = [
        ...(data.samples || []).map((sample: SearchSample) => ({
          id: sample.id,
          type: 'sample' as const,
          title: sample.name,
          subtitle: `${getUserDisplayName(sample.library.user)} • ${sample.library.name}`,
          fileUrl: sample.fileUrl,
          sampleData: sample,
          icon: <PlayCircle size={16} className="text-purple-400" />
        })),
        ...(data.libraries || []).map((library: SearchLibrary) => ({
          id: library.id,
          type: 'library' as const,
          title: library.name,
          subtitle: `${getUserDisplayName(library.user)} • ${library._count.samples} samples`,
          href: `/library/${library.id}`,
          icon: <Folder size={16} className="text-blue-400" />
        })),
        ...(data.users || []).map((user: SearchUser) => ({
          id: user.id,
          type: 'user' as const,
          title: getUserDisplayName(user),
          subtitle: `${user._count.libraries} libraries`,
          href: `/user/${user.id}`,
          icon: <User size={16} className="text-green-400" />
        }))
      ];
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Handle item selection
  const handleSelect = useCallback((result: SearchResult) => {
    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('sounddrop-recent-searches', JSON.stringify(newRecent));
    
    // Handle based on result type
    if (result.type === 'sample') {
      // Samples don't navigate - they're handled by the play button
      return;
    }
    
    // Navigate for libraries and users
    if (result.href) {
      router.push(result.href);
      onOpenChange(false);
      setQuery('');
    }
  }, [query, recentSearches, router, onOpenChange]);

  // Handle recent search selection
  const handleRecentSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('sounddrop-recent-searches');
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-2xl border border-white/20 rounded-lg shadow-2xl overflow-hidden">
        {/* Enhanced glass background overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
        <div className="relative z-10">
        <CommandInput
          placeholder="Search for samples, libraries, or users..."
          value={query}
          onValueChange={setQuery}
          className="border-none bg-transparent text-white placeholder:text-white/50 focus:ring-0"
        />
        
        <CommandList className="max-h-96 overflow-y-auto">
          {!query && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    value={search}
                    onSelect={() => handleRecentSearch(search)}
                    className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer"
                  >
                    <Clock size={16} className="text-white/40" />
                    <span className="text-white">{search}</span>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={clearRecentSearches}
                  className="flex items-center justify-center p-2 text-white/50 hover:text-white/70 cursor-pointer text-sm"
                >
                  Clear recent searches
                </CommandItem>
              </CommandGroup>
              <CommandSeparator className="bg-white/10" />
            </>
          )}

          {!query && (
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => {
                  router.push('/trending');
                  onOpenChange(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer"
              >
                <TrendingUp size={16} className="text-orange-400" />
                <div>
                  <div className="text-white">Trending</div>
                  <div className="text-xs text-white/50">Popular samples today</div>
                </div>
              </CommandItem>
              
              <CommandItem
                onSelect={() => {
                  router.push('/upload');
                  onOpenChange(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer"
              >
                <Music size={16} className="text-purple-400" />
                <div>
                  <div className="text-white">Upload</div>
                  <div className="text-xs text-white/50">Add your own samples</div>
                </div>
              </CommandItem>
            </CommandGroup>
          )}

          {query && (
            <>
              {isLoading && (
                <CommandEmpty className="py-8 text-center text-white/50">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                </CommandEmpty>
              )}

              {!isLoading && results.length === 0 && (
                <CommandEmpty className="py-8 text-center text-white/50">
                  <div className="space-y-2">
                    <Search size={32} className="mx-auto text-white/30" />
                    <div>No results found for &quot;{query}&quot;</div>
                    <div className="text-xs">Try different keywords or check spelling</div>
                  </div>
                </CommandEmpty>
              )}

              {results.length > 0 && (
                <>
                  {/* Group results by type */}
                  {results.filter(r => r.type === 'sample').length > 0 && (
                    <CommandGroup heading="Samples">
                      {results
                        .filter(r => r.type === 'sample')
                        .slice(0, 5)
                        .map((result) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            onSelect={handleSelect}
                          />
                        ))}
                    </CommandGroup>
                  )}

                  {results.filter(r => r.type === 'library').length > 0 && (
                    <CommandGroup heading="Libraries">
                      {results
                        .filter(r => r.type === 'library')
                        .slice(0, 3)
                        .map((result) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            onSelect={handleSelect}
                          />
                        ))}
                    </CommandGroup>
                  )}

                  {results.filter(r => r.type === 'user').length > 0 && (
                    <CommandGroup heading="Users">
                      {results
                        .filter(r => r.type === 'user')
                        .slice(0, 3)
                        .map((result) => (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            onSelect={handleSelect}
                          />
                        ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="border-t border-white/15 p-3 text-xs text-white/70 flex items-center justify-between bg-black/30">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 backdrop-blur rounded text-xs text-white border border-white/20">↵</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 backdrop-blur rounded text-xs text-white border border-white/20">↑↓</kbd>
              <span>to navigate</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800/80 backdrop-blur rounded text-xs text-white border border-white/20">esc</kbd>
            <span>to close</span>
          </div>
        </div>
        </div>
      </div>
    </CommandDialog>
  );
}

function SearchResultItem({
  result,
  onSelect
}: {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}) {
  // Audio hook for samples
  const { trackPlay } = usePlayTracking();
  const audioHook = useAudio(
    result.id,
    result.fileUrl || '',
    result.title,
    {
      onPlay: () => trackPlay(result.id)
    }
  );

  const isSample = result.type === 'sample';
  const showPlayButton = isSample && result.fileUrl;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioHook.isPlaying) {
      audioHook.pause();
    } else {
      audioHook.play();
    }
  };

  return (
    <CommandItem
      value={result.title}
      onSelect={() => onSelect(result)}
      className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer group"
    >
      <motion.div
        className="flex-shrink-0"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {result.icon}
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate group-hover:text-purple-200">
          {result.title}
        </div>
        {result.subtitle && (
          <div className="text-xs text-white/50 truncate">
            {result.subtitle}
          </div>
        )}
      </div>
      
      {showPlayButton && (
        <motion.button
          onClick={handlePlayToggle}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {audioHook.isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <PlayCircle size={14} className="text-purple-400" />
            </motion.div>
          ) : audioHook.isPlaying ? (
            <Pause size={14} className="text-purple-400" />
          ) : (
            <Play size={14} className="text-purple-400" />
          )}
        </motion.button>
      )}
      
      {!showPlayButton && (
        <div className="text-white/30 group-hover:text-white/50">
          <Search size={12} />
        </div>
      )}
    </CommandItem>
  );
}