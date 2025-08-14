'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
  const { settings, isLoading, updateUsername, updateDisplayName, checkUsernameAvailability } = useUserSettings();
  const { userAvatar } = useAuth();
  
  const [usernameValue, setUsernameValue] = useState('');
  const [displayNameValue, setDisplayNameValue] = useState('');
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    isAvailable?: boolean;
    error?: string;
  }>({ checking: false });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      setUsernameValue(settings.username);
      setDisplayNameValue(settings.displayName ?? '');
    }
  }, [settings]);

  // Check username availability with debouncing
  const handleUsernameChange = async (newUsername: string) => {
    setUsernameValue(newUsername);
    
    if (!newUsername || newUsername === settings?.username) {
      setUsernameCheck({ checking: false });
      return;
    }

    setUsernameCheck({ checking: true });

    // Debounce the check
    setTimeout(async () => {
      const result = await checkUsernameAvailability(newUsername);
      if (result) {
        setUsernameCheck({
          checking: false,
          isAvailable: result.isAvailable,
          error: result.error || undefined
        });
      } else {
        setUsernameCheck({ checking: false });
      }
    }, 500);
  };

  // Save username changes
  const handleSaveUsername = async () => {
    if (!usernameValue || usernameValue === settings?.username || !usernameCheck.isAvailable) {
      return;
    }

    setIsSaving(true);
    await updateUsername(usernameValue);
    setIsSaving(false);
    setUsernameCheck({ checking: false });
  };

  // Save display name changes
  const handleSaveDisplayName = async () => {
    if (displayNameValue === (settings?.displayName || '')) {
      return;
    }

    setIsSaving(true);
    await updateDisplayName(displayNameValue || null);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center">
        <div className="text-white">Unable to load settings</div>
      </div>
    );
  }

  const usernameHasChanged = usernameValue !== settings.username;
  const displayNameHasChanged = displayNameValue !== (settings.displayName ?? '');
  const canSaveUsername = usernameHasChanged && usernameCheck.isAvailable && !usernameCheck.checking;
  const canSaveDisplayName = displayNameHasChanged;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 space-y-8"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {userAvatar ? (
                <Image src={userAvatar} alt="Profile" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-white/60">Manage your profile and privacy</p>
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Email</label>
            <div className="glass-input p-3 text-white/60 cursor-not-allowed">
              {settings.email}
            </div>
            <p className="text-xs text-white/40">Your email cannot be changed</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Username</label>
            <div className="relative">
              <input
                type="text"
                value={usernameValue}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="glass-input w-full p-3 text-white placeholder-white/40"
                placeholder="Choose a unique username"
                disabled={isSaving}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameCheck.checking && (
                  <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                )}
                {!usernameCheck.checking && usernameCheck.isAvailable && usernameHasChanged && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
                {!usernameCheck.checking && usernameCheck.error && usernameHasChanged && (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            {usernameCheck.error && usernameHasChanged && (
              <p className="text-xs text-red-400">{usernameCheck.error}</p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-white/40">
                Your username is shown publicly on your libraries and samples
              </p>
              {canSaveUsername && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSaveUsername}
                  disabled={isSaving}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Display Name</label>
            <input
              type="text"
              value={displayNameValue}
              onChange={(e) => setDisplayNameValue(e.target.value)}
              className="glass-input w-full p-3 text-white placeholder-white/40"
              placeholder="Optional friendly name"
              disabled={isSaving}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-white/40">
                If set, this will be shown instead of your username
              </p>
              {canSaveDisplayName && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSaveDisplayName}
                  disabled={isSaving}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Privacy Protection</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Your real name from Google is never stored or displayed publicly. Only your chosen username 
              and optional display name are visible to other users. Your email is kept private.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}