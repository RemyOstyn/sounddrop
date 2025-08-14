'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UserSettings {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateSettingsData {
  username?: string;
  displayName?: string | null;
}

interface UsernameCheckResult {
  username: string;
  isAvailable: boolean;
  error: string | null;
  sanitized: string | null;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings
  const fetchSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Fetch settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user settings
  const updateSettings = async (updates: UpdateSettingsData): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const data = await response.json();
      setSettings(data.user);
      
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Update settings error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResult | null> => {
    try {
      const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Check username error:', error);
      return null;
    }
  };

  // Update username
  const updateUsername = async (username: string): Promise<boolean> => {
    return updateSettings({ username });
  };

  // Update display name
  const updateDisplayName = async (displayName: string | null): Promise<boolean> => {
    return updateSettings({ displayName });
  };

  // Load settings when user changes
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setSettings(null);
      setError(null);
    }
  }, [user]);

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    updateUsername,
    updateDisplayName,
    checkUsernameAvailability,
  };
}