import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateUsernameComplete } from '@/lib/username-utils';

// GET - Check if username is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    // Get current user (if authenticated) to allow checking their own username
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const excludeUserId = user?.id;

    // Validate username
    const validation = await validateUsernameComplete(username, excludeUserId);

    return NextResponse.json({
      username: username,
      isAvailable: validation.isValid,
      error: validation.error || null,
      sanitized: validation.sanitized || null
    });

  } catch (error) {
    console.error('Check username availability error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}