# APSS 2026 — Seminar Website

English-first, bilingual (English/Persian) static website for the 9th Annual Ardabil Pharmaceutical Sciences Seminar.

## Files
- `index.html` — page content and structure
- `style.css` — responsive visual design
- `script.js` — language toggle and mobile navigation

## Publish on GitHub Pages
1. Open your GitHub repository.
2. Upload these files to the repository root (the same level as `README.md`).
3. Commit the changes to the `main` branch.
4. In **Settings → Pages**, choose **Deploy from a branch**, select `main`, and select `/(root)`.
5. Visit the published GitHub Pages URL after deployment completes.

## Important
- The current contact button opens an email draft; it does **not** upload PDF files.
- The submission portal, authentication, private file storage, and administrator dashboard must be configured separately before collecting submissions.
- The scientific topics and dates are draft content. Confirm all details with the seminar organizing committee before public launch.
- Do not commit participant data, uploaded PDFs, API secrets, or administrator credentials to this public repository.

## Email authentication setup (new)
- `auth.html` and `auth.js` provide a basic email registration/sign-in page.
- `supabase-config.js` contains placeholders for the Supabase Project URL and **publishable** key. Fill them in locally before committing. A publishable key is intended for browser use; never use an `sb_secret_` or `service_role` key here.
- In Supabase Authentication URL Configuration, set the Site URL to `https://dikdaraq.github.io/apss/` and add `https://dikdaraq.github.io/apss/auth.html` to Redirect URLs. Adjust if your GitHub Pages URL differs.
- Email confirmation must be enabled if you want users to verify their addresses. Test with a test account before announcing registration.
- Authentication only is implemented in this step. Submission records, actual document upload, and the admin dashboard are not yet implemented. Do not accept real submissions until the complete flow and access policies have been tested.


The homepage navigation includes **Sign in** and **Register** links to `auth.html`. Configure `supabase-config.js` before deployment.


## Bilingual language behavior
- Persian (RTL) is the default on the homepage and authentication page.
- The language switch toggles English/Persian and stores the choice in browser local storage, so it persists across pages on the same site.
- Keep your existing working `supabase-config.js`; do not replace it with a template. Never commit a secret/service-role key.
