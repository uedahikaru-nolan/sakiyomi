-- Create group-icons storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-icons',
  'group-icons',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for group-icons bucket
-- Allow authenticated users to upload group icons
CREATE POLICY "Authenticated users can upload group icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-icons' AND
  (storage.foldername(name))[1] = 'group-icons'
);

-- Allow authenticated users to update group icons
CREATE POLICY "Authenticated users can update group icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-icons' AND
  (storage.foldername(name))[1] = 'group-icons'
);

-- Allow authenticated users to delete group icons
CREATE POLICY "Authenticated users can delete group icons"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-icons' AND
  (storage.foldername(name))[1] = 'group-icons'
);

-- Allow public read access to all group icons
CREATE POLICY "Public can view group icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-icons');
