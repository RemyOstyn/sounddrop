import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  // Handle missing authorization code
  if (!code) {
    console.error('Missing authorization code');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'Authorization code not received');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
              console.warn('Failed to set auth cookies:', error);
            }
          },
        },
      }
    );

    // Exchange the code for a session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Session exchange error:', exchangeError);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = new URL('/login', baseUrl);
      loginUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    if (!session) {
      console.error('No session received after code exchange');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = new URL('/login', baseUrl);
      loginUrl.searchParams.set('error', 'Failed to establish session');
      return NextResponse.redirect(loginUrl);
    }

    console.log('Auth callback success for user:', session.user.email);

    // Create the redirect URL using production base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectUrl = new URL(redirectTo, baseUrl);
    
    // Optional: Add success message
    if (redirectTo === '/') {
      redirectUrl.searchParams.set('message', 'Successfully signed in!');
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Auth callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }
}