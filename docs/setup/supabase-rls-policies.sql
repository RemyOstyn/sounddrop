-- Supabase Storage RLS Policies for SoundDrop
-- Run these commands in your Supabase SQL Editor

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- No need to enable it manually

-- ============================================================================
-- AUDIO SAMPLES BUCKET POLICIES
-- ============================================================================

-- Allow public read access to audio samples
CREATE POLICY "Public read access for audio-samples" ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'audio-samples');

-- Allow authenticated users to upload audio samples
CREATE POLICY "Authenticated users can upload audio-samples" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'audio-samples');

-- Allow users to update their own audio files
CREATE POLICY "Users can update own audio files" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'audio-samples' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own audio files
CREATE POLICY "Users can delete own audio files" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'audio-samples' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- LIBRARY ICONS BUCKET POLICIES
-- ============================================================================

-- Allow public read access to library icons
CREATE POLICY "Public read access for library-icons" ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'library-icons');

-- Allow authenticated users to upload library icons
CREATE POLICY "Authenticated users can upload library-icons" ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'library-icons');

-- Allow users to update their own library icons
CREATE POLICY "Users can update own library icons" ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'library-icons' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own library icons
CREATE POLICY "Users can delete own library icons" ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'library-icons' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';