import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { validateUsernameComplete, displayNameSchema } from '@/lib/username-utils';
import { z } from 'zod';

// Schema for updating user settings
const updateUserSettingsSchema = z.object({
  username: z.string().optional(),
  displayName: z.string().nullable().optional(),
});

// GET - Get current user settings
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });

  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get user settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { username, displayName } = updateUserSettingsSchema.parse(body);

    // Prepare update data
    const updateData: { username?: string; displayName?: string | null } = {};

    // Validate username if provided
    if (username !== undefined) {
      const usernameValidation = await validateUsernameComplete(username, user.id);
      if (!usernameValidation.isValid) {
        return NextResponse.json(
          { error: usernameValidation.error },
          { status: 400 }
        );
      }
      updateData.username = usernameValidation.sanitized!;
    }

    // Validate display name if provided
    if (displayName !== undefined) {
      if (displayName === null || displayName === '') {
        updateData.displayName = null;
      } else {
        const displayNameValidation = displayNameSchema.safeParse(displayName);
        if (!displayNameValidation.success) {
          return NextResponse.json(
            { error: 'Display name format is invalid' },
            { status: 400 }
          );
        }
        updateData.displayName = displayName.trim();
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}