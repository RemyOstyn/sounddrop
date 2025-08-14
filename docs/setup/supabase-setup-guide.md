# Supabase Setup Guide for SoundDrop

This guide walks through setting up Supabase for the SoundDrop project, including database, authentication, and storage configuration.

## 1. Create Supabase Project

### Initial Setup
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: `sounddrop`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Select closest to your target users
4. Click "Create new project"
5. Wait 2-3 minutes for project provisioning

### Retrieve Project Credentials
Once your project is ready, collect the following credentials:

1. **Go to Settings → API**:
   - Copy `Project URL` (https://[project-id].supabase.co)
   - Copy `anon/public` key
   - Copy `service_role` key (keep this secret!)

2. **Go to Settings → Database**:
   - Copy `Connection string` under "Connection parameters"
   - You'll need both pooled and direct connection URLs

## 2. Environment Variables Setup

Create `.env.local` in your project root with the credentials from above:

```env
# Database (replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF])
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload Limits
MAX_AUDIO_SIZE_MB="50"
MAX_ICON_SIZE_MB="2"
ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3,audio/mp4,audio/ogg"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp,image/gif"
```

## 3. Storage Buckets Configuration

### Create Audio Samples Bucket
1. Go to **Storage** in the Supabase dashboard
2. Click "New Bucket"
3. Configure:
   - **Name**: `audio-samples`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: `52428800` (50MB in bytes)
   - **Allowed MIME types**: `audio/mpeg,audio/wav,audio/mp3,audio/mp4,audio/ogg`
4. Click "Save"

### Create Library Icons Bucket
1. Click "New Bucket" again
2. Configure:
   - **Name**: `library-icons`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: `2097152` (2MB in bytes)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`
3. Click "Save"

### Set Up Bucket Policies
For both buckets, you'll need to configure Row Level Security (RLS) policies:

1. Click on the bucket name
2. Go to "Configuration" tab
3. Add the following policies:

**For audio-samples bucket:**
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'audio-samples');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-samples');

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audio-samples' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**For library-icons bucket:**
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'library-icons');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library-icons');

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'library-icons' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 4. Authentication Configuration

### Enable Google OAuth
1. Go to **Authentication → Providers**
2. Find "Google" and click the toggle to enable
3. You'll need Google OAuth credentials:

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

### Configure OAuth in Supabase
1. Back in Supabase, paste your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
2. Click "Save"

## 5. Database Configuration

### Row Level Security (RLS)
After running your Prisma migrations, enable RLS on your tables:

1. Go to **Database → Tables**
2. For each table (`User`, `Category`, `Library`, `Sample`, `Favorite`):
   - Click on the table
   - Go to "Authentication" section
   - Toggle "Enable RLS" to ON

### Basic RLS Policies
Add these basic policies to get started:

```sql
-- Users table - users can only access their own data
CREATE POLICY "Users can view own data" ON "User" FOR SELECT TO authenticated USING (id = auth.uid()::text);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE TO authenticated USING (id = auth.uid()::text);

-- Categories table - public read access
CREATE POLICY "Public read access" ON "Category" FOR SELECT TO public USING (true);

-- Libraries table - public read, users can manage their own
CREATE POLICY "Public read access" ON "Library" FOR SELECT TO public USING ("isPublic" = true);
CREATE POLICY "Users can manage own libraries" ON "Library" FOR ALL TO authenticated USING ("userId" = auth.uid()::text);

-- Samples table - public read access
CREATE POLICY "Public read access" ON "Sample" FOR SELECT TO public USING (true);
CREATE POLICY "Users can upload to own libraries" ON "Sample" FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM "Library" WHERE id = "libraryId" AND "userId" = auth.uid()::text)
);

-- Favorites table - users can only access their own favorites
CREATE POLICY "Users can manage own favorites" ON "Favorite" FOR ALL TO authenticated USING ("userId" = auth.uid()::text);
```

## 6. Testing the Setup

### Verify Database Connection
```bash
# Generate Prisma client
npx prisma generate

# Test database connection
npx prisma db push
```

### Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to your app
3. Try to authenticate with Google
4. Check Supabase dashboard → Authentication → Users to see if user was created

### Test Storage
1. Try uploading a test file to each bucket through the Supabase dashboard
2. Verify the file is accessible at the generated URL
3. Test file size limits by trying to upload files larger than the configured limits

## 7. Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify your DATABASE_URL and DIRECT_URL are correct
- Check that your database password doesn't contain special characters that need URL encoding
- Ensure your IP address is allowed (Supabase allows all by default)

**Authentication Issues:**
- Verify Google OAuth redirect URLs match exactly
- Check that Google+ API is enabled in Google Cloud Console
- Ensure your domain is added to Google Cloud Console authorized domains

**502 Bad Gateway on Login Callback:**
If you encounter 502 errors during OAuth callback, it's likely due to large headers from OAuth providers. This requires Nginx configuration updates on your server:

```nginx
large_client_header_buffers 4 16k;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
send_timeout 60s;
proxy_buffer_size   128k;
proxy_buffers       4 256k;
proxy_busy_buffers_size 256k;
client_max_body_size 10M;
```

Reference: [Supabase Discussion #29211](https://github.com/orgs/supabase/discussions/29211)

**Storage Upload Issues:**
- Verify bucket policies are correctly set up
- Check file size and MIME type restrictions
- Ensure RLS is properly configured on storage.objects

**Environment Variables:**
- Double-check all environment variables are set correctly
- Restart your development server after changing .env.local
- Verify no typos in variable names

### Getting Help
- Check [Supabase Documentation](https://supabase.com/docs)
- Visit [Supabase Discord](https://discord.supabase.com)
- Review logs in Supabase dashboard → Logs

## 8. Production Considerations

### Security
- Never commit your `.env.local` file
- Use environment variables in your deployment platform
- Regularly rotate your service role key
- Monitor authentication logs for suspicious activity

### Performance
- Consider setting up a CDN for your storage buckets
- Monitor database connection pool usage
- Set up database backups
- Consider read replicas for high traffic

### Monitoring
- Set up Supabase alerts for quota usage
- Monitor API usage and rate limits
- Set up error tracking for authentication flows

This completes the Supabase setup for SoundDrop. Once configured, you'll have a fully functional backend with database, authentication, and storage ready for your application.