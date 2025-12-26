-- Make the task-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'task-attachments';

-- Drop the public read policy that allows anyone to view files
DROP POLICY IF EXISTS "Public can view task attachments" ON storage.objects;

-- Add a user-scoped SELECT policy so users can only view their own files
CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);