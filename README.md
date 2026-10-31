# APSS 9 — complete website package

This package contains the public seminar homepage, email authentication, participant submission portal, private document storage integration, and organizer dashboard.

## Included features
- Persian-first, RTL interface with Persian/English language toggle.
- Email-only registration and sign-in through Supabase Auth.
- Multiple submissions per participant account.
- Required title, authors, scientific field, and **3–7 keywords** per submission.
- Abstract and poster uploads (PDF, PNG, DOC, DOCX; 10 MB maximum per file).
- Automatic UTF-8 `keywords.txt` creation as a distinct `File` object for every submission, stored beside its abstract and poster in the private `apss-documents` bucket.
- Participant view of their own submissions.
- Admin allowlist and review dashboard with short-lived signed download links for abstract, poster, and keywords files.

## Deploy to GitHub Pages
1. Extract this ZIP and upload the contents of `apss_website_starter/` to the root of your `Dikdaraq/apss` repository.
2. **Keep your existing working `supabase-config.js` unchanged.** It was not included in the uploaded ZIP, so this package includes `supabase-config.example.js` only as a template. If you do not already have the config in the repository, copy the example to `supabase-config.js` and enter your existing Supabase Project URL and publishable key. Never put a secret/service-role key in browser code.
3. Run `keyword_migration.sql` once in Supabase SQL Editor before accepting submissions. This adds `keywords_file_path` to `public.submissions`.
4. Your existing private bucket must remain named `apss-documents`. In Supabase Storage → `apss-documents` → Settings, add `text/plain` to the allowed MIME types (keep the existing PDF/PNG/DOC/DOCX types). The migration also updates the participant upload policy to allow `.txt` while preserving the UUID-folder restriction. Admin read access remains private; no public Storage policy is needed.
5. The existing `admin_setup.sql` is included for reference. If the admin dashboard is already working, do not rerun or change the existing admin allowlist unnecessarily.
6. Commit to `main`, wait for GitHub Pages to deploy, then test a complete submission using a participant account and download all three files using the organizer account.

## Database change required
The new database field is `public.submissions.keywords_file_path` (text, nullable for older submissions). The migration also adjusts the existing upload policy to allow `.txt` files in the same user-owned folder. The migration is idempotent and can be run safely more than once.

## File layout in private Storage
Each submission is stored under a unique folder:

`<auth-user-uuid>/submissions/<submission-uuid>/abstract-<random-name>.<ext>`

`<auth-user-uuid>/submissions/<submission-uuid>/poster-<random-name>.<ext>`

`<auth-user-uuid>/submissions/<submission-uuid>/keywords.txt`

The text file is UTF-8 (with BOM for compatibility with common Windows text editors) and contains the submission title, authors, and one keyword per line.

## Security
- Keep `apss-documents` private.
- Do not disable Row Level Security or add public read policies.
- Do not expose Supabase secret/service-role keys.
- The front-end extension and size checks are not malware/content scanning. Review uploaded files before opening them.


## Keyword upload correction
The portal now creates an explicit browser `File` named `keywords.txt` with MIME type `text/plain`, verifies the Storage upload response, and uses a cache-busting script URL. Replace `submissions.js` and `submissions.html` on GitHub Pages (or deploy the full package) so the browser loads this corrected code.
