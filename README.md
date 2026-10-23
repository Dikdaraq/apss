# APSS 9 website — submission portal update

This update adds `submissions.html` and `submissions.js` for authenticated participants to submit **multiple abstracts** from one account. The portal accepts PDF, PNG, DOC, and DOCX files, with a 10 MB frontend limit per file, and lists the current user's own submissions.

## Deploy
1. Upload the updated files in this folder to the root of your `Dikdaraq/apss` GitHub repository.
2. Keep your existing, working `supabase-config.js` file unchanged. It must define `window.APSS_SUPABASE_URL` and `window.APSS_SUPABASE_PUBLISHABLE_KEY`. Never use a Supabase secret/service-role key in browser files.
3. Commit the changes to `main` and wait for GitHub Pages to deploy.
4. In Supabase Authentication → URL Configuration, ensure your GitHub Pages site URL and `auth.html` redirect URL are configured.
5. Test with a test account before accepting real submissions.

## Supabase requirements
- Bucket named `apss-documents`, set to **private**.
- Bucket allowed MIME types: `application/pdf`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- Existing database tables: `public.profiles` and `public.submissions` as created in the setup steps.
- Existing Storage policies must allow an authenticated user to upload into a first-level folder equal to their Auth user UUID and read only their own folder.
- The `submissions` table must allow a user to insert rows only where `user_id = auth.uid()` and select only their own rows.

## Important security note
The form checks file extension and size in the browser; this is not content-level file validation. Bucket MIME restrictions and Storage RLS are also required. The portal does not yet provide an administrator dashboard, document review workflow, or virus scanning. Do not publish secret keys or submitted documents in the GitHub repository.


## Administrator dashboard (new)
1. Upload `admin.html`, `admin.js`, and `admin_setup.sql` to the repository root. Keep your existing `supabase-config.js` unchanged.
2. In Supabase SQL Editor, run the contents of `admin_setup.sql` once. This creates a separate `apss_admins` allowlist and policies; it does not disable RLS or expose the table publicly.
3. Register the organizer account using the normal website registration flow and confirm the email. In Supabase Dashboard → Authentication → Users, copy that account's UUID.
4. In SQL Editor, run `insert into public.apss_admins (user_id) values ('PASTE-USER-UUID-HERE');` after replacing the placeholder with the organizer's actual UUID. Do not add participant accounts.
5. Sign in with that organizer account, then visit `https://dikdaraq.github.io/apss/admin.html`.

The dashboard uses short-lived signed links (60 seconds) for private documents. It allows admins to update submission status only. Never place a Supabase secret/service-role key in browser code. Test with a separate organizer account before production use.
