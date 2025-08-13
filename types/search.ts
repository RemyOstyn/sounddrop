// Search-related types
import type { SampleWithDetails, LibraryWithDetails, User, Category } from './database';

// Search API response types
export interface SearchSample {
  id: string;
  name: string;
  library: {
    id: string;
    name: string;
    user: {
      name: string | null;
    };
  };
}

export interface SearchLibrary {
  id: string;
  name: string;
  description: string | null;
  user: {
    name: string | null;
  };
  _count: {
    samples: number;
  };
}

export interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  _count: {
    libraries: number;
  };
}

export interface SearchCategory {
  id: string;
  name: string;
  description: string | null;
}

// API response structure
export interface SearchApiResponse {
  samples?: SearchSample[];
  libraries?: SearchLibrary[];
  users?: SearchUser[];
  categories?: SearchCategory[];
}

// Search result UI types
export type SearchResultType = 'sample' | 'library' | 'user' | 'category';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  icon?: React.ReactNode;
}

// Search request types
export interface SearchRequest {
  query: string;
  types?: SearchResultType[];
  limit?: number;
}

// Search context types
export interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  recentSearches: string[];
}

export interface SearchActions {
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  addToRecent: (query: string) => void;
  clearRecent: () => void;
}