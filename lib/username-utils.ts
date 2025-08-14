import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .refine(val => !val.startsWith('_'), 'Username cannot start with underscore')
  .refine(val => !val.endsWith('_'), 'Username cannot end with underscore')
  .refine(val => !val.includes('__'), 'Username cannot contain consecutive underscores');

// Display name validation schema (more lenient)
export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(50, 'Display name must be at most 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Display name contains invalid characters')
  .optional();

/**
 * Check if a username is available (unique in database)
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!existingUser) {
      return true; // Username is available
    }

    // If we're checking for a specific user (during update), allow their own username
    return excludeUserId ? existingUser.id === excludeUserId : false;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

/**
 * Generate a unique username based on email
 * Format: prefix from email + random suffix
 */
export async function generateUsernameFromEmail(email: string): Promise<string> {
  // Extract prefix from email (before @)
  const emailPrefix = email.split('@')[0];
  
  // Clean prefix: remove invalid chars, ensure it starts with alphanumeric
  let baseUsername = emailPrefix
    .replace(/[^a-zA-Z0-9_]/g, '_') // Replace invalid chars with underscores
    .replace(/^[^a-zA-Z0-9]+/, '') // Remove leading non-alphanumeric chars
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

  // Ensure minimum length and valid format
  if (baseUsername.length < 3 || !/^[a-zA-Z0-9]/.test(baseUsername)) {
    baseUsername = 'sounddrop_user';
  }

  // Truncate if too long (leave room for suffix)
  if (baseUsername.length > 20) {
    baseUsername = baseUsername.substring(0, 20);
  }

  // Try the base username first
  if (await isUsernameAvailable(baseUsername)) {
    return baseUsername;
  }

  // If base is taken, try with random suffixes
  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const candidate = `${baseUsername}_${suffix}`;
    
    if (await isUsernameAvailable(candidate)) {
      return candidate;
    }
  }

  // Fallback: use timestamp-based suffix
  const timestamp = Date.now().toString().slice(-6);
  return `sounddrop_${timestamp}`;
}

/**
 * Generate a random username with guaranteed uniqueness
 */
export async function generateRandomUsername(): Promise<string> {
  const adjectives = [
    'cool', 'awesome', 'epic', 'super', 'mega', 'ultra', 'pro', 'elite',
    'swift', 'bright', 'sharp', 'smart', 'quick', 'fast', 'wild', 'bold'
  ];
  
  const nouns = [
    'beat', 'sound', 'wave', 'drop', 'mix', 'tune', 'vibe', 'echo',
    'rhythm', 'bass', 'pulse', 'flow', 'track', 'loop', 'beat', 'sonic'
  ];

  for (let i = 0; i < 20; i++) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    const candidate = `${adjective}_${noun}_${number}`;
    
    if (await isUsernameAvailable(candidate)) {
      return candidate;
    }
  }

  // Ultimate fallback
  return `user_${Date.now().toString().slice(-8)}`;
}

/**
 * Validate and sanitize a user-provided username
 */
export function validateUsername(username: string): { isValid: boolean; error?: string; sanitized?: string } {
  try {
    const sanitized = username.trim().toLowerCase();
    usernameSchema.parse(sanitized);
    
    return {
      isValid: true,
      sanitized
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'Invalid username format'
      };
    }
    
    return {
      isValid: false,
      error: 'Invalid username format'
    };
  }
}

/**
 * Get display name for a user (displayName if set, otherwise username)
 */
export function getDisplayName(user: { username: string; displayName?: string | null }): string {
  return user.displayName || user.username;
}

/**
 * Reserved usernames that cannot be used
 */
export const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'moderator', 'mod',
  'support', 'help', 'api', 'www', 'mail', 'email',
  'sounddrop', 'system', 'user', 'users', 'guest',
  'null', 'undefined', 'anonymous', 'unknown'
]);

/**
 * Check if username is reserved
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

/**
 * Complete username validation (format + availability + not reserved)
 */
export async function validateUsernameComplete(
  username: string, 
  excludeUserId?: string
): Promise<{ isValid: boolean; error?: string; sanitized?: string }> {
  // First validate format
  const formatValidation = validateUsername(username);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  const sanitized = formatValidation.sanitized!;

  // Check if reserved
  if (isReservedUsername(sanitized)) {
    return {
      isValid: false,
      error: 'This username is reserved and cannot be used'
    };
  }

  // Check availability
  const isAvailable = await isUsernameAvailable(sanitized, excludeUserId);
  if (!isAvailable) {
    return {
      isValid: false,
      error: 'This username is already taken'
    };
  }

  return {
    isValid: true,
    sanitized
  };
}