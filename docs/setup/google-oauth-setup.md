# Google OAuth Setup Guide for SoundDrop

## Overview
This guide walks through setting up Google OAuth authentication for SoundDrop using Supabase Auth. This enables users to sign in with their Google accounts seamlessly.

## Prerequisites
- ✅ Supabase project created and configured (from Phase 1)
- ✅ Google Cloud Console account
- ✅ Basic understanding of OAuth 2.0 flow

## Step 1: Google Cloud Console Configuration

### 1.1 Create OAuth 2.0 Credentials

1. **Navigate to Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing project for SoundDrop

2. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

3. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type (for public app)
   - Fill in required fields:
     - **App name**: "SoundDrop"
     - **User support email**: Your email
     - **App logo**: Upload SoundDrop logo (optional)
     - **App domain**: Your production domain
     - **Developer contact**: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed during development

4. **Create OAuth 2.0 Client ID**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "SoundDrop Web Client"
   - **Important**: Leave redirect URIs empty for now (will add from Supabase)

### 1.2 Note Down Credentials
Save these for Supabase configuration:
- **Client ID**: `xxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

## Step 2: Supabase Auth Configuration

### 2.1 Get Supabase Redirect URLs

1. **Navigate to Supabase Dashboard**:
   - Go to your SoundDrop project
   - Navigate to "Authentication" → "Providers"
   - Find Google provider (don't enable yet)
   - Copy the "Callback URL (for OAuth)" - it looks like:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```

### 2.2 Update Google OAuth Redirect URIs

1. **Return to Google Cloud Console**:
   - Go to "APIs & Services" → "Credentials"
   - Click on your OAuth 2.0 Client ID
   - In "Authorized redirect URIs", add:
     - **Production**: `https://[your-project-ref].supabase.co/auth/v1/callback`
     - **Development**: You may also add localhost for testing
   - Save changes

### 2.3 Configure Google Provider in Supabase

1. **Enable Google Provider**:
   - In Supabase Dashboard → "Authentication" → "Providers"
   - Find "Google" and toggle it ON
   - Enter your Google OAuth credentials:
     - **Client ID**: Your Google Client ID
     - **Client Secret**: Your Google Client Secret

2. **Configure Provider Settings**:
   - **Scopes**: `email profile` (default is fine)
   - **Additional Scopes**: Can add `https://www.googleapis.com/auth/userinfo.profile` if needed
   - Save configuration

## Step 3: Application Configuration

### 3.1 Environment Variables
No additional environment variables needed - Supabase handles OAuth configuration.

### 3.2 Test OAuth Flow

1. **Test in Supabase**:
   - Go to "Authentication" → "Users"
   - Click "Invite user" and try "Continue with Google"
   - Should redirect to Google OAuth consent screen
   - After accepting, should return to Supabase with user created

## Step 4: Development vs Production

### Development Setup
For local development, your OAuth flow will be:
```
localhost:3000 → Supabase Auth → Google OAuth → Supabase → localhost:3000/auth/callback
```

### Production Setup
For production, ensure:
1. **Domain Verification**: Add your production domain to Google OAuth consent screen
2. **Authorized Domains**: Add production domain to authorized domains
3. **SSL Certificate**: Ensure production site has valid SSL
4. **App Review**: For public launch, submit app for Google review

## Step 5: OAuth Flow Implementation

### 5.1 Client-Side Login Trigger
```typescript
// In your login component
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('Error signing in with Google:', error.message)
  }
}
```

### 5.2 Auth Callback Handler
```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
```

## Step 6: User Data Access

### 6.1 User Metadata
After successful Google OAuth, user object includes:
```typescript
{
  id: "uuid-string",
  email: "user@gmail.com",
  user_metadata: {
    email: "user@gmail.com",
    email_verified: true,
    full_name: "John Doe",
    iss: "https://accounts.google.com",
    name: "John Doe",
    picture: "https://lh3.googleusercontent.com/...",
    provider_id: "123456789",
    sub: "123456789"
  }
}
```

### 6.2 Database User Creation
Set up a database trigger to create User record on auth.users insert:
```sql
-- This can be added to Supabase SQL editor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, name, avatar)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'picture'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 7: Testing Checklist

### Pre-Launch Testing
- [ ] **OAuth Flow**: Complete sign-in flow works
- [ ] **User Creation**: Database User record created correctly
- [ ] **Session Persistence**: User stays logged in across browser sessions
- [ ] **Logout**: Sign-out flow works correctly
- [ ] **Error Handling**: Network failures handled gracefully
- [ ] **Mobile Testing**: OAuth works on mobile devices
- [ ] **Cross-browser**: Works on Chrome, Safari, Firefox, Edge

### Production Readiness
- [ ] **Domain Configuration**: Production domain added to Google OAuth
- [ ] **SSL Certificate**: Valid SSL certificate on production domain
- [ ] **Privacy Policy**: Privacy policy linked in OAuth consent screen
- [ ] **Terms of Service**: Terms of service accessible
- [ ] **App Icon**: SoundDrop icon uploaded to OAuth consent screen
- [ ] **Google Review**: App submitted for Google review if needed

## Common Issues & Solutions

### Issue: "OAuth Error: redirect_uri_mismatch"
**Solution**: Ensure redirect URI in Google Console exactly matches Supabase callback URL

### Issue: "OAuth Error: invalid_client"
**Solution**: Verify Client ID and Secret are correctly entered in Supabase

### Issue: "This app isn't verified"
**Solution**: Expected for development. For production, submit for Google review

### Issue: User creation fails
**Solution**: Check database trigger and ensure User table schema matches

### Issue: Session doesn't persist
**Solution**: Verify cookies are set correctly and middleware is configured

## Security Best Practices

1. **Never expose Client Secret**: Keep it secure in Supabase only
2. **Use HTTPS**: Always use SSL in production
3. **Validate Users**: Implement proper user validation in your app
4. **Monitor Usage**: Watch for unusual OAuth activity
5. **Regular Updates**: Keep Supabase client libraries updated

## Support Resources

- **Supabase Auth Docs**: [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Google OAuth Docs**: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- **Supabase Discord**: Community support for troubleshooting

This completes the Google OAuth setup for SoundDrop. The authentication system will provide a seamless, secure login experience for users.