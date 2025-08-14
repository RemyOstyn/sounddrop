'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AuthUser } from '@/types/supabase';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthState {
  // State
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // Internal actions
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Track sync attempts to prevent duplicates
let isUserSyncing = false;
let lastSyncUserId: string | null = null;

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,

    // Sign in with Google OAuth
    signInWithGoogle: async (redirectTo?: string) => {
      const supabase = createClient();
      set({ isLoading: true, error: null });

      try {
        const baseUrl = window.location.origin;
        const callbackUrl = `${baseUrl}/auth/callback`;
        
        const { error } = await supabase.auth.signInWithOAuth({ // Removed unused 'data' variable
          provider: 'google',
          options: {
            redirectTo: redirectTo ? `${callbackUrl}?redirectTo=${encodeURIComponent(redirectTo)}` : callbackUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            skipBrowserRedirect: false,
            scopes: 'openid email profile',
          },
        });

        if (error) {
          console.error('OAuth sign-in error:', error);
          toast.error('Sign-in failed', {
            description: error.message,
          });
          set({ error: error.message, isLoading: false });
          return;
        }

        // OAuth redirect will handle the rest
        // The loading state will be cleared when the session is established
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
        console.error('Sign-in error:', error);
        toast.error('Sign-in failed', {
          description: errorMessage,
        });
        set({ error: errorMessage, isLoading: false });
      }
    },

    // Sign out
    signOut: async () => {
      const supabase = createClient();
      set({ isLoading: true, error: null });

      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Sign-out error:', error);
          toast.error('Sign-out failed', {
            description: error.message,
          });
          set({ error: error.message, isLoading: false });
          return;
        }

        // Clear user data
        set({ 
          user: null, 
          session: null, 
          isLoading: false,
          error: null 
        });

        toast.success('Signed out successfully');

        // Redirect to home page
        window.location.href = '/';
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign-out failed';
        console.error('Sign-out error:', error);
        toast.error('Sign-out failed', {
          description: errorMessage,
        });
        set({ error: errorMessage, isLoading: false });
      }
    },

    // Initialize auth state
    initialize: async () => {
      const supabase = createClient();
      set({ isLoading: true });

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session retrieval error:', error);
          set({ 
            error: error.message,
            user: null,
            session: null,
            isLoading: false,
            isInitialized: true
          });
          return;
        }

        // Sync user if session exists (only if not already syncing)
        if (session?.user && !isUserSyncing && lastSyncUserId !== session.user.id) {
          isUserSyncing = true;
          lastSyncUserId = session.user.id;
          
          try {
            const response = await fetch('/api/user/sync', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('Initial user sync result:', data.message);
            } else {
              console.error('Initial user sync failed:', response.statusText);
            }
          } catch (error) {
            console.error('Initial user sync error:', error);
          } finally {
            isUserSyncing = false;
          }
        }

        // Set initial state
        set({
          user: session?.user as AuthUser || null,
          session,
          isLoading: false,
          isInitialized: true,
          error: null
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
          
          // Sync user with database when they sign in (only if not already syncing)
          if (event === 'SIGNED_IN' && session?.user && !isUserSyncing && lastSyncUserId !== session.user.id) {
            isUserSyncing = true;
            lastSyncUserId = session.user.id;
            
            try {
              const response = await fetch('/api/user/sync', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('User sync result:', data.message);
              } else {
                console.error('User sync failed:', response.statusText);
              }
            } catch (error) {
              console.error('User sync error:', error);
            } finally {
              isUserSyncing = false;
            }
          }
          
          set({
            user: session?.user as AuthUser || null,
            session,
            isLoading: false,
            error: null
          });

          // Handle specific events
          if (event === 'SIGNED_OUT') {
            // Clear any stored user data and reset sync tracking
            set({ user: null, session: null });
            lastSyncUserId = null;
          }
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Auth initialization failed';
        console.error('Auth initialization error:', error);
        set({ 
          error: errorMessage,
          user: null,
          session: null,
          isLoading: false,
          isInitialized: true
        });
      }
    },

    // Refresh session
    refreshSession: async () => {
      const supabase = createClient();
      const { isLoading } = get();
      
      // Don't refresh if already loading
      if (isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Session refresh error:', error);
          set({ error: error.message, isLoading: false });
          return;
        }

        set({
          user: session?.user as AuthUser || null,
          session,
          isLoading: false,
          error: null
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
        console.error('Session refresh error:', error);
        set({ error: errorMessage, isLoading: false });
      }
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Internal setters
    setUser: (user: AuthUser | null) => {
      set({ user });
    },

    setSession: (session: Session | null) => {
      set({ session });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setError: (error: string | null) => {
      set({ error });
    },
  }))
);

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Initialize auth store when the module loads
  useAuthStore.getState().initialize();
}

// Export selectors for better performance
export const selectUser = (state: AuthState) => state.user;
export const selectSession = (state: AuthState) => state.session;
export const selectIsAuthenticated = (state: AuthState) => !!state.user;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
export const selectError = (state: AuthState) => state.error;