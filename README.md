# Slidely Events

A Next.js and TypeScript team event calendar. This first deployable milestone uses fictional sample events only. It builds without Supabase, Gemini, or map credentials.

## What works

- Month calendar with continuous multi-day strips, overlapping-event lanes and week-boundary continuation. Annual overview remains in the left sidebar.
- Default List spans past and upcoming dates; Home/Today returns to today. Search and category/tag filters apply across all dates.
- Permanent left sidebar and full-width main area. Details use a right-side overlay without resizing the layout, with Close, Edit, Escape and backdrop dismissal. All scrollbars stay thin.
- Shared hover/focus previews in Month and List; event preview, Add and Edit use the same accessible right-side modal shell.
- Add/edit events, with browser-local storage that survives reloads.
- Create/edit/recolor/merge/delete categories and tags, with previews of affected events.
- Compact, full-width sidebar sections with a 15% wider rail, colored checkbox filters, event counts, and row menus. Use the section + to create an item or its … menu to edit, merge, or delete it.
- Shared form and confirmation modals for event and vocabulary actions. Event removal keeps internal recovery data; the Trash navigation has been removed from this version.
- On-screen setup guide at `/setup`.

## What comes next

Email OTP and domain restriction, Supabase shared data and admin roles, Gemini enrichment, and map view. No private workspace or login protection is claimed by this local sample-data prototype. Use synthetic information only. GitHub upload and Vercel deployment are deferred at the user's request.

## Run on this computer

For everyday use: double-click `Start calendar.cmd` in this project folder. When it says Ready, open http://127.0.0.1:3000. Keep the window open while using the calendar.

Local data is stored under `slidely.events.workspace.v1` in browser localStorage, scoped to this exact origin and browser profile. It is not team storage or a backup. Switching between `localhost` and `127.0.0.1`, clearing site data, or using a different profile gives you a different local copy. Use the address above consistently.

Codex can also run these steps for you. If using PowerShell yourself:

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
- `npm test`: dates/timezones, merge/reassignment, deduplication, trash/restore, and saved-data validation (15 tests, including sidebar count/filter behavior).
- `npm run build`: production compilation.
- `npm run typecheck`: strict TypeScript checks (run after build on a clean checkout).

GitHub Actions runs these checks for pushes and pull requests.

`npm run format` keeps source files readable and consistent. A narrow dependency override selects patched minimatch 11 for TypeScript ESLint's parser tooling to address GHSA-g3hv-75wg-m249; verify lint when updating this dependency and remove the override when the upstream package selects a patched version itself.

## Source structure

All design tokens and shared style recipes live in `src/design/`. Read `docs/design-system.md` for the four typography roles, Slidely palette, and editing rules. `npm run design:check` prevents scattered color/type/icon definitions. The generated theme is refreshed automatically before dev/build. Inter is hosted locally; no remote font service is needed.

`src/app` holds routes and the global theme. `src/features/calendar` owns calendar interactions, `src/features/events` owns the form and sample data, `src/features/taxonomy` owns management dialogs, `src/features/workspace` owns validated local storage and atomic domain changes, and `src/lib/dates` centralizes date-only rules. Service integrations will be added in separate adapters rather than inside calendar components. See `plan.md` for the complete project plan.

## Brand asset

The Slidely wordmark in `public/brand/slidely-wordmark.png` and app icon from https://slidely.ai/slidelylogo.png are used for this Slidely-owned internal app. Do not repurpose these assets for unrelated projects. UI colors are sourced from Slidely's verified website tokens. Typography uses locally hosted Inter with a system fallback and the documented caption/body/section/heading scale.
