// UI Component types and interfaces

export type TabId = 'all' | 'trending' | 'recent';

export interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  tabs: TabItem[];
}

// View types
export type ViewType = 'grid' | 'list';

export interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Pagination UI types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

export interface InfiniteScrollState {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  error?: string | null;
}