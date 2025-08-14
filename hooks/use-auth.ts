'use client';

import { useAuthStore, selectUser, selectSession, selectIsAuthenticated, selectIsLoading, selectIsInitialized, selectError } from '@/lib/stores/auth-store';

export const useAuth = () => {
  const user = useAuthStore(selectUser);
  const session = useAuthStore(selectSession);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const isInitialized = useAuthStore(selectIsInitialized);
  const error = useAuthStore(selectError);
  
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const clearError = useAuthStore((state) => state.clearError);

  // Computed properties
  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  const userAvatar = user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
  
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
  
  const userEmail = user?.email || '';

  return {
    // State
    user,
    session,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    
    // Actions
    signInWithGoogle,
    signOut,
    refreshSession,
    clearError,
    
    // Computed properties
    userInitials,
    userAvatar,
    userName,
    userEmail,
  };
};