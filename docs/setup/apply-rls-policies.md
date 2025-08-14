# Apply Supabase Storage RLS Policies

This guide helps you set up the necessary Row-Level Security (RLS) policies for SoundDrop's file upload functionality.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**

## Step 2: Create Storage Buckets (if not already created)

First, ensure your storage buckets exist. Go to **Storage** in the dashboard and create:

### Audio Samples Bucket
- **Name**: `audio-samples`
- **Public bucket**: ✅ Enabled
- **File size limit**: `52428800` (50MB)
- **Allowed MIME types**: `audio/mpeg,audio/wav,audio/mp3,audio/mp4,audio/ogg`

### Library Icons Bucket  
- **Name**: `library-icons`
- **Public bucket**: ✅ Enabled
- **File size limit**: `2097152` (2MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

## Step 3: Apply RLS Policies

Copy and paste the contents of `supabase-rls-policies.sql` into the SQL Editor and run it.

Alternatively, you can copy each policy individually:

### Enable RLS on storage.objects
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Audio Samples Policies
```sql
-- Public read access
CREATE POLICY "Public read access for audio-samples" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'audio-samples');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload audio-samples" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-samples');

-- Users can manage their own files
CREATE POLICY "Users can update own audio files" ON storage.objects 
FOR UPDATE TO authenticated USING (
    bucket_id = 'audio-samples' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own audio files" ON storage.objects 
FOR DELETE TO authenticated USING (
    bucket_id = 'audio-samples' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Library Icons Policies
```sql
-- Public read access
CREATE POLICY "Public read access for library-icons" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'library-icons');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload library-icons" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'library-icons');

-- Users can manage their own files
CREATE POLICY "Users can update own library icons" ON storage.objects 
FOR UPDATE TO authenticated USING (
    bucket_id = 'library-icons' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own library icons" ON storage.objects 
FOR DELETE TO authenticated USING (
    bucket_id = 'library-icons' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Verify Setup

Run this query to check if all policies were created:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

You should see 8 policies total (4 for each bucket).

## Step 5: Test Upload

After applying the policies:
1. Restart your development server: `npm run dev`
2. Try creating a new library with an icon
3. Try uploading an audio file

## Troubleshooting

### If uploads still fail:
1. Check that you're authenticated (logged in)
2. Verify the bucket names match exactly: `audio-samples` and `library-icons`
3. Ensure the buckets are set to **public**
4. Check the browser console for detailed error messages

### Common Issues:
- **"new row violates row-level security policy"** - RLS policies not applied correctly
- **"Bucket not found"** - Bucket names don't match or buckets don't exist
- **"File too large"** - File exceeds bucket size limits
- **"Invalid file type"** - File MIME type not in allowed list

The file path structure used by our app is: `{userId}/{timestamp}-{libraryId}.{extension}`

This ensures each user can only access files in their own folder (`{userId}/`).