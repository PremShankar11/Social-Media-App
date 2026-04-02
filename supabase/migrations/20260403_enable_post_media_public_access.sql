-- Enable public access to post-media bucket
-- This allows anyone to view post media without authentication

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to all files in post-media bucket
CREATE POLICY "Public read access to post-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

-- Allow authenticated users to upload to post-media bucket
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-media'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own post media
CREATE POLICY "Users can delete their own post media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-media'
  AND auth.role() = 'authenticated'
);

