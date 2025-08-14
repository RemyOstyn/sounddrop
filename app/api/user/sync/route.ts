import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateUsernameFromEmail } from '@/lib/username-utils';

// POST - Sync authenticated user with Prisma database
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (existingUser) {
      // User already exists, return existing user
      return NextResponse.json({ 
        user: existingUser,
        synced: false,
        message: 'User already exists'
      });
    }

    // Generate a unique username for privacy
    const username = await generateUsernameFromEmail(user.email!);

    // Create new user in Prisma database
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null, // Keep for migration but don't use publicly
        username: username,
        displayName: null, // User can set this later in settings
        avatar: user.user_metadata?.picture || user.user_metadata?.avatar_url || null,
        createdAt: new Date(user.created_at),
      }
    });

    return NextResponse.json({ 
      user: newUser,
      synced: true,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}