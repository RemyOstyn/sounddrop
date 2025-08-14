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

  // Computed properties - privacy-focused (simplified for now)
  const userName = user?.email?.split('@')[0] || 'User'; // Use email prefix as display
  const userInitials = user?.email?.[0]?.toUpperCase() || '?';
  const userAvatar = user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
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