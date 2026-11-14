# Slidely Events

A Next.js and TypeScript team event calendar. This first deployable milestone uses fictional sample events only. It builds without Supabase, Gemini, or map credentials.

## What works

- Month and year calendars with category dots and inclusive multi-day events.
- Chronological event list, day selection, search, category/tag filters.
- Independent collapsible sidebars; desktop preferences saved on the device.
- Responsive calendar/list navigation and a labeled, keyboard-accessible event dialog.
- Add/edit/remove sample events for the current tab session. Reload resets the samples.
- On-screen setup guide at `/setup`.

## What comes next

Email OTP and domain restriction, Supabase shared data and admin roles, category/tag management, Gemini enrichment, and map view. No private workspace or login protection is claimed by this public sample-data prototype. Use synthetic information only.

## Run on this computer

Codex can run these steps for you. If using PowerShell yourself:

1. Open this project folder in your terminal.
2. Run `npm install` once to download dependencies.
3. Run `npm run dev`.
4. Open http://localhost:3000 in your browser.
5. Keep the terminal open while using the local preview. Press Ctrl+C to stop it.

## Deploy on Vercel

1. Go to https://vercel.com/new and sign in.
2. Import `cebe-fyi/slidely-event-cal`. If missing, Configure GitHub App and grant access to this repository.
3. Keep the Next.js framework preset, root directory, install command, and build command at their defaults.
4. No environment variables are needed for this milestone. Click Deploy.
5. Wait for Ready, then click Visit.

If the project is already connected, pushing to its production branch (normally `main`) triggers deployment. A production deployment must exist before some Vercel settings can apply. The detailed beginner guide is available at `/setup` and in `plan.md`.

## Future service configuration

Copy `.env.example` to `.env.local` when Supabase integration is implemented. Never commit real environment files or secrets. The current app intentionally does not use these placeholders. Preview and production databases must be separate before real data is introduced.

First planned admin: `cebe@slidely.ai`, after verified login and explicit provisioning. This email being listed here does not grant access by itself.

## Verification

- `npm run lint`: lint and React/Next checks.
- `npm test`: date overlap, leap year, calendar boundary, and timezone tests.
- `npm run build`: production compilation.
- `npm run typecheck`: strict TypeScript checks (run after build on a clean checkout).

GitHub Actions runs these checks for pushes and pull requests.

`npm run format` keeps source files readable and consistent. A narrow dependency override selects patched minimatch 11 for TypeScript ESLint's parser tooling to address GHSA-g3hv-75wg-m249; verify lint when updating this dependency and remove the override when the upstream package selects a patched version itself.

## Source structure

`src/app` holds routes and the global theme. `src/features/calendar` owns calendar interactions, `src/features/events` owns the form and sample data, and `src/lib/dates` centralizes date-only rules. Service integrations will be added in separate adapters rather than inside calendar components. See `plan.md` for the complete project plan.

## Brand asset

The Slidely wordmark in `public/brand/slidely-wordmark.png` was retrieved from https://slidely.ai/landing-page/hero/image-wordmark-slidely-brand.png for this Slidely-owned internal app. Do not repurpose the asset for unrelated projects. The UI uses a system font fallback; exact brand font/color approval remains pending.
