-- APSS 9 keyword-file migration. Run once in Supabase SQL Editor before deploying.
-- Adds a private Storage object path to each submission row.

alter table public.submissions
  add column if not exists keywords_file_path text;

-- The existing private bucket and Storage RLS policies already permit each
-- authenticated participant to upload/read files inside their own UUID folder.
-- Admins can read all objects in apss-documents through admin_setup.sql.
-- No public bucket or public read policy is required.

-- Permit the new .txt keyword file in the existing participant upload policy.
-- This preserves the same user-folder restriction and adds only the txt extension.
drop policy if exists "APSS users upload own documents" on storage.objects;
create policy "APSS users upload own documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'apss-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(storage.extension(name)) in ('pdf','png','doc','docx','txt')
);
