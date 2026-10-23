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
