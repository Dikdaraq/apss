-- APSS 9: allow verified administrators to delete submissions and their private files.
-- Run once in Supabase SQL Editor. This does not make the bucket public.

grant delete on table public.submissions to authenticated;

drop policy if exists "APSS admins delete submissions" on public.submissions;
create policy "APSS admins delete submissions"
on public.submissions for delete to authenticated
using (exists (
  select 1 from public.apss_admins a where a.user_id = (select auth.uid())
));

drop policy if exists "APSS admins delete submitted documents" on storage.objects;
create policy "APSS admins delete submitted documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'apss-documents'
  and exists (
    select 1 from public.apss_admins a where a.user_id = (select auth.uid())
  )
);
