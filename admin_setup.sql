-- APSS 9 administrator access setup. Run once in Supabase SQL Editor.
-- First create the admin user account through the normal website registration flow.

create table if not exists public.apss_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.apss_admins enable row level security;
grant select on public.apss_admins to authenticated;

drop policy if exists "Admins can verify own role" on public.apss_admins;
create policy "Admins can verify own role"
on public.apss_admins for select to authenticated
using (user_id = (select auth.uid()));

-- Do not add INSERT/UPDATE/DELETE policies for apss_admins.
-- Add the trusted organizer account manually with the SQL below after registration.

-- Admins can review all submissions and update only the review status.
grant select on public.submissions to authenticated;
grant update (status, updated_at) on public.submissions to authenticated;

drop policy if exists "APSS admins read all submissions" on public.submissions;
create policy "APSS admins read all submissions"
on public.submissions for select to authenticated
using (exists (
  select 1 from public.apss_admins a where a.user_id = (select auth.uid())
));

drop policy if exists "APSS admins update submission status" on public.submissions;
create policy "APSS admins update submission status"
on public.submissions for update to authenticated
using (exists (
  select 1 from public.apss_admins a where a.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.apss_admins a where a.user_id = (select auth.uid())
));

-- Admins may create short-lived signed links to files in the private bucket.
grant select on storage.objects to authenticated;
drop policy if exists "APSS admins read submitted documents" on storage.objects;
create policy "APSS admins read submitted documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'apss-documents'
  and exists (
    select 1 from public.apss_admins a where a.user_id = (select auth.uid())
  )
);

-- IMPORTANT: Replace the UUID below with the organizer account's Auth user ID.
-- Find it in Supabase Dashboard > Authentication > Users, then run separately:
-- insert into public.apss_admins (user_id) values ('PASTE-USER-UUID-HERE');
