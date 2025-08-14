import type { User } from '@/types/database';

/**
 * Get the display name for a user object
 * Priority: displayName → username → fallback
 */
export function getUserDisplayName(
  user: Pick<User, 'username' | 'displayName'> | { username?: string | null; displayName?: string | null } | null | undefined,
  fallback: string = 'Anonymous'
): string {
  if (!user) return fallback;
  
  // Prefer displayName if set
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }
  
  // Fall back to username
  if (user.username?.trim()) {
    return user.username.trim();
  }
  
  return fallback;
}

/**
 * Get user initials for avatar display
 * Uses display name or username to generate initials
 */
export function getUserInitials(
  user: Pick<User, 'username' | 'displayName'> | { username: string; displayName?: string | null } | null | undefined,
  fallback: string = '?'
): string {
  if (!user) return fallback;
  
  const displayName = getUserDisplayName(user, '');
  if (!displayName) return fallback;
  
  // Split by spaces and take first letter of each word
  const words = displayName.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return fallback;
  
  if (words.length === 1) {
    // Single word - take first two characters if available
    const word = words[0];
    return word.length >= 2 ? word.slice(0, 2).toUpperCase() : word[0].toUpperCase();
  }
  
  // Multiple words - take first character of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Legacy compatibility: handle old user objects that might have 'name' field
 * This helps during migration period
 */
export function getUserDisplayNameLegacy(
  user: unknown,
  fallback: string = 'Anonymous'
): string {
  if (!user || typeof user !== 'object') return fallback;
  
  // New system: use username/displayName
  if ('username' in user && typeof user.username === 'string') {
    return getUserDisplayName(user as { username: string; displayName?: string | null }, fallback);
  }
  
  // Legacy system: fall back to name field if username not available
  if ('name' in user && typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }
  
  // Ultimate fallback
  if ('email' in user && typeof user.email === 'string') {
    return user.email.split('@')[0];
  }
  
  return fallback;
}