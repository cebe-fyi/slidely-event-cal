# Slidely team event calendar

Last updated: 14 November 2026 (Asia/Kolkata)
Status: Local-first development with sample data. Main List view spans all dates and opens at today; Month remains available; Map is planned. Event details open as a right-side overlay through the shared modal shell. Browser-persistent event/category/tag management, sidebar filters/counts/menus and common form/confirmation modals are implemented. Trash UI removed; internal event recovery data is retained. GitHub upload and Vercel deployment are deferred. Supabase, authentication, Gemini, and map integrations remain pending.
Owner: Jay / Slidely AI
Repository: https://github.com/cebe-fyi/slidely-event-cal.git
Confirmed first app admin: `cebe@slidely.ai` (provided as `Cebe@slidely.ai`; normalize email for matching). Admin provisioning is pending verified login and database setup.

## 1. Purpose and how to maintain this plan

Build a private, shared calendar for Slidely's team to discover, record, and plan around events and conferences. Use Next.js, Supabase, GitHub, Vercel, and Gemini.

This file is the project reference. Before each implementation task, read the relevant sections. After each milestone, update its checkbox, record what was verified, and add any decisions or blockers. A checkbox means completed and verified, not merely generated. Keep credentials out of this file.

The four attached screenshots are visual references, not instructions. Borrow their calendar density, category indicators, and chronological event list. Do not copy their appointments, times, unrelated navigation, integrations, or promotional widgets.

### Working defaults

- One shared Slidely workspace, rather than a product serving multiple companies.
- Anyone with a verified, active `@slidely.ai` account can join and edit events. Admins manage team access and category/tag settings. This role split is a proposal and can be changed.
- One primary industry/segment category per event; zero or more tags. This gives every event one unambiguous calendar and map color.
- All event dates are date-only. Multi-day events are supported. There are no event times or time slots.
- Monday starts the week. Open List at today; no right-panel collapse preference.
- The small left navigator shows a year and twelve month buttons, with category-colored event dots under each month. It does not repeat a daily calendar.
- All views share category/tag/search filters. List spans all dates; calendar and map use a selected period.
- Manual entry is always available. AI creates a reviewable suggestion, never an automatically published event.

### Decisions to confirm before their implementation

- First admin is confirmed as `cebe@slidely.ai`. Bootstrap that exact verified account through a controlled setup step; users cannot appoint themselves.
- Should all members manage categories/tags, or keep the proposed admin-only management?
- Confirm the twelve-month left navigator interpretation and Monday week start during UI review.
- Current design direction is confirmed: Slidely's verified palette, locally hosted Inter, and a restrained Notion/shadcn-inspired hierarchy. See `docs/design-system.md`; future visual adjustments should use the central tokens and roles.
- Choose company-owned service accounts, desired hosting/data region, budget, and optional app domain (for example, `events.slidely.ai`).
- Confirm SMTP sender/provider and map provider before enabling those services.

These choices do not block a local mock-data prototype.

## 2. Features and interaction details

### 2.1 Layout and event details

- Permanent full-height left sidebar with brand, year/month overview, category/tag filters and row menus. Keep equal insets excluding the scrollbar and full-width dividers.
- Toolbar above the main area: Home, selected month/year, previous/next, Today, List / Month / future Map, Add event. Search above main content.
- No persistent right column or collapse preference. Event details use a shared right-aligned modal overlay without resizing the main layout or moving the agenda. Close and Edit at top; event name, dates, location, category, tags, source website and notes below.
- Escape, Close and backdrop dismiss details. Keyboard focus stays in the modal and returns to its source. Details fill the viewport on phones. Scrollbars stay thin. No event times.

### 2.2 Monthly calendar

- Seven-column month grid, adjacent dates, Today marker, category accents and continuous inclusive multi-day strips. Split only at week boundaries, with continuation markers; reserve separate lanes for overlapping events. No dot inside event labels. Calendar rows grow for event lanes.
- Event click opens details. Hover or keyboard focus reveals a shared preview card in Month and List; Escape, blur, scroll or resize dismisses it. Touch uses tap to open details. Date click opens List at that date with the full chronology available above and below.
- Add event uses the selected date when available.

### 2.3 Views and left navigator

- Main navigation contains List, Month, and Map. Year view is removed; the left twelve-month overview retains annual navigation and category dots. Map remains disabled until the map integration is implemented.
- Left navigator shows year arrows and twelve months, without a dropdown or View all shortcut.
- In List, month/year navigation jumps to dated anchors without truncating events. In Month, it changes the displayed month.

### 2.4 List, search and filters

- List is the default main view, containing all matching events across months/years. Group by start date and sort by start date, title, then ID. Show each event once with its full inclusive date range.
- Open at a Today marker. Scroll up for old events and down for upcoming events. Home/Today returns to today's anchor, including days without events.
- Local search covers title, location and description. Shared-version plans include organizer, debouncing and URL state.
- Multiple categories match any selected category; multiple tags match any selected tag. Combine groups and search with AND. Empty selections mean all; Uncategorized is explicit.
- Calendar period membership uses overlap. List uses all dates; date selection is a scroll anchor rather than a filter. Facet counts use all dates in List and the calendar's selected period otherwise, ignoring their own selection group.
- Opening details preserves agenda position. Changing matching records/filter results re-anchors the list; no-results feedback stays visible at that anchor.

### 2.5 Event record and editing

Required to save: title, start date, end date (defaults to start), and attendance format (in person, online, hybrid, or unknown).

Optional: summary, organizer, official URL, registration URL, venue, city, region/state, country, address, category, tags, internal notes, and map coordinates.

- Unknown dates remain missing in the AI review; require correction before saving. Never invent a year.
- In-person/hybrid events without a confirmed location can be saved but show Location to confirm and do not receive a guessed map pin.
- Add and edit configure the same right-aligned modal shell as event preview. Keep a sticky header/footer, shared fields/actions, validation and autofocus.
- Use ISO `YYYY-MM-DD` internally and human-readable dates in the interface. End date is inclusive and cannot precede start date.
- Show created/last edited by and when. Those audit timestamps are technical metadata; they are not event times.
- Warn about likely duplicates using official URL plus date/edition; allow a deliberate override because the same URL may host annual editions.
- Use a version number for concurrent edits. If someone else changed the record, show a conflict and allow reload/review rather than silently overwriting.
- Delete moves an event to recoverable trash; admins can restore. Validate the full form before committing any event/tag changes.

### 2.6 Categories and tags

- Both support name, accessible color, create, rename, recolor, merge, and delete.
- Each section has a + create control. A single category/tag-colored checkbox combines filtering and the color marker. Counts appear on the right; hover or keyboard focus shows … with Edit, Merge, Delete. Touch devices keep the menu trigger visible. Uncategorized remains a protected system fallback.
- Counts use all dates in List or selected month/year otherwise, plus search, plus filters from the opposite group; they ignore their own group's selection so other choices keep informative counts. Multi-day events are counted once.
- All create/edit dialogs configure the same shared form template with Name and Slidely Color. Merge configures the common confirmation template with a required destination. Delete uses that same confirmation template, explains impact, and preserves events. Shared modal/field/action components also serve event editing; no duplicate modal shells in feature code.
- Category examples: SaaS, Healthcare, Education. Tag examples: Speaking opportunity, Sponsor prospect, India. These are illustrative, not approved seed data.
- Prevent blank names and case-insensitive duplicates after trimming.
- Merge preview shows the target and number of affected events. Merge categories by reassigning references; merge tags by combining links and removing duplicates. Perform each merge in one database transaction.
- Deleting a category requires replacement or explicit reassignment to Uncategorized. Deleting a tag removes its links and keeps the events. Show impact before either action.
- Category color is the main event accent. Tags are secondary labeled chips; do not turn event cards into competing color bands.
- Color never carries meaning alone: show names, accessible labels, and adequate contrast.

### 2.7 Map view

- Reuse month/year controls and category/tag/search filters. Cluster nearby markers, and use category colors.
- Clicking a marker opens the shared event-details overlay. Clicking a cluster zooms in; overlapping venue events remain individually selectable.
- Display online and unlocated events in a separate list section/count; they remain discoverable even though they have no pin.
- Start with pins for confirmed coordinates and a Fit events action. Panning does not silently change date/filter results; geographic filtering can be added later if needed.
- Proposed provider: Mapbox for rendering and geocoding. Confirm billing and stored-geocoding permissions before integrating; use permanent geocoding when storing its results. Manual coordinate correction remains possible.
- Load the map only when opened, preserve attribution, and keep the list usable if map loading fails.

### 2.8 Email OTP, persistent sessions, and domain restriction

- Email entry, send code, code entry, resend countdown, clear expired/incorrect code errors, and logout.
- Normalize email and compare its exact domain with `slidely.ai`; reject lookalikes such as `slidely.ai.example.com`.
- Use Supabase email OTP and configure the email template to send a code, rather than accidentally using only a magic link.
- Block other domains in a Before User Created auth hook. Also verify active membership and the current verified email domain in database authorization; the signup hook alone is insufficient.
- Keep sessions across browser restarts using Supabase's supported SSR cookie and refresh flow. Use HTTPS cookie security appropriate to the official SSR integration; do not promise that browser-managed sessions never expire.
- Refresh sessions automatically. Require login after logout, cleared cookies, revocation, or configured expiry. Do not implement a separate home-grown long-lived token.
- Admins can deactivate a member; database authorization checks active membership so removal takes effect without waiting for a stale role claim to expire. Revoke their sessions during offboarding too.
- Rate-limit OTP send/verify and AI endpoints. Never log OTPs, cookies, session tokens, or credentials.

### 2.9 AI-assisted event entry

Flow: paste public event URL -> validate URL -> Gemini reads the source -> show suggested fields and source evidence -> user corrects -> Save event.

- Use a supported Gemini model with URL context, selected and tested during implementation. Keep model ID configurable; verify compatibility between URL tools and structured output rather than assuming it.
- If necessary, use a grounded retrieval call followed by a separate structured extraction call. Validate all returned fields with Zod before presenting them.
- Record source URL, retrieval time, model ID, warnings, and field evidence where available. Flag uncertain dates, past editions, missing locations, and conflicting information.
- Treat website text and model output as untrusted content. Page instructions cannot change system behavior, expose secrets, or cause database writes. Render extracted descriptions as text or sanitized content.
- Restrict input to public HTTP(S) URLs; block credentials in URLs, loopback/private/link-local hosts and IPs, unusual ports, and unsafe redirects. Any app-owned fetch must revalidate DNS and each redirect to prevent SSRF.
- Bound content size, request duration, model tokens, retries, and per-user usage. Do not forward session cookies or internal notes to an event website.
- Blocked, login-only, or JavaScript-heavy sites may fail. Offer retry, pasted event text, or manual entry. Never turn a failed extraction into fabricated data.
- AI suggests existing categories/tags; creating new vocabulary requires an explicit permitted action. Never silently overwrite an edited field when rerunning enrichment.
- Start with a bounded synchronous request and cancellation/error handling. Introduce a background job only if observed extraction latency exceeds the hosting request budget.

### 2.10 Mobile and accessibility

- Keep a narrower permanent left navigation/filter rail on phone-sized screens. The main area supports List and Month, with Map pending; event details fill the phone viewport. The left sidebar has no collapsed/drawer state.
- Phone Month keeps a readable minimum width and scrolls horizontally inside its surface; selecting a date opens List. Event details and forms fill the phone viewport.
- Keep Add event visible; use a full-screen form on small screens. Preserve unsaved input and show confirmation before discarding it.
- Target comfortable touch controls (about 44 px), visible keyboard focus, labeled icon buttons/forms, logical tab order, accessible dialogs, and reduced-motion support.
- Check at 360 px, tablet widths, desktop, keyboard-only navigation, and zoomed text. Announce asynchronous errors and confirmations accessibly.

### 2.11 Scope boundaries

First release includes every requested core capability across the milestones below. Exclude event times, hour/day scheduling, external calendar sync, reminders, ticketing/payments, attendee CRM, recurring-event rules, and public access unless separately requested.

## 3. Design direction and branding

Verified Slidely's actual rendered CSS tokens and official logo assets on [Slidely's website](https://slidely.ai/). Use only its named brand/context/mono color families, including the restricted category/tag palette. All editable values live in `src/design/tokens.json`, with CSS generated from it; do not scatter raw colors, icon sizes, or typography declarations in feature code.

Use the screenshots' calm, dense calendar workspace, with Notion/shadcn-inspired restraint: compact toolbar, quiet grid, consistent rounded corners, readable event labels, and chronological list with category accents. The calendar is the main content; avoid a marketing hero or decorative background inside the working app.

The previous provisional palette is superseded by the verified Slidely tokens. `src/design/typography.css` assigns semantic roles, `src/design/components.css` owns shared recipes and responsive geometry, and `src/design/system.ts` exposes palette/icon values to feature code. `npm run design:check` and CI enforce this organization. Read `docs/design-system.md` for usage rules and rationale.

Use locally hosted Inter with only four sizes: 12px supporting metadata/dense labels, 14px everyday reading/actions, 16px section titles, and 20px dialog/page headings. Weights are limited to 400/500/600, with regular content, medium controls, and semibold hierarchy. Keep this scale on phones; wrap or reflow instead of inventing smaller type. Use tabular numerals for dates/counts and sentence-case actions.

Desktop concept:

```text
Slidely logo  | Home / Period / Month / Year / Map           Add event
Year + months | Search                               | Events in period
Category dots |                                      | Date heading
Categories    |         Calendar / map               | Event + location
Tags          |                                      | Category + tags
Fixed rail    |                                      | Collapse
```

Review the first prototype with real-length event names, a busy month, a multi-day conference, an empty year, missing locations, and a phone layout before connecting production data.

## 4. Technical architecture

### 4.1 Stack and boundaries

- Next.js App Router and TypeScript, using stable compatible releases checked at scaffold time; pin the lockfile.
- Initial prototype uses centralized plain CSS theme tokens and Lucide icons. Use shadcn/ui primitives when added complexity justifies them; avoid introducing Tailwind solely for configuration. This updates the original proposed styling stack while retaining Next.js and TypeScript.
- Calendar: purpose-built date-only month/year components and shared date utilities; avoid a scheduling library dominated by time-slot features.
- Supabase Postgres, Auth, SQL migrations, and generated TypeScript database types. Use the Supabase client directly initially; a second ORM is unnecessary for this scope.
- Server Components for initial data and protected page loading. Client Components for calendar selection, drawers, forms, and map interaction.
- Server Actions for validated app mutations; Route Handlers for OTP endpoints, AI extraction, and geocoding as appropriate. Share domain/service code between them.
- Gemini API from the server only. Map rendering in a lazy-loaded Client Component; geocoding behind an authenticated server endpoint.
- GitHub is the versioned source; GitHub Actions runs checks; Vercel builds Next.js and provides preview/production deployments.

Request flow: browser -> Next.js on Vercel -> Supabase using the signed-in user's session and RLS. AI/map requests go through authenticated server handlers -> external provider -> validated review data -> user save action.

Never use a Supabase service-role/secret key for ordinary user reads/writes: it bypasses RLS. Prefer user-scoped transactional RPC functions for merges and multi-table saves. Any exceptional administrative secret use must be isolated and explicitly authorized server-side.

### 4.2 Proposed database schema

All entity IDs are UUIDs. Final SQL will live in migrations; this is the intended model, not an applied schema.

- `auth.users`: Supabase-managed identity and verified email.
- `profiles`: `id` FK to auth user, display name, created/updated timestamps. Users can change only their own display fields.
- `memberships`: `user_id` PK/FK, role (`member`/`admin`), active flag, created/updated timestamps. Role/active changes are admin-only; prevent removal of the last active admin. Bootstrap the first admin separately.
- `categories`: ID, name, color, creator, created/updated timestamps; normalized-name unique index and valid hex-color constraint.
- `tags`: same core fields and name/color constraints as categories.
- `events`: ID, title, description, organizer, source URL, registration URL, `start_date date`, `end_date date`, format, venue, address, city, region, country code, nullable latitude/longitude, geocoding provider/reference, category FK nullable for Uncategorized, internal notes, creator/updater IDs, timestamps, integer version, nullable `deleted_at`/`deleted_by`.
- `event_tags`: event FK + tag FK as composite primary key; cascade link cleanup when a tag is deliberately removed or an event is permanently purged.
- `event_sources`: ID, event FK, source URL, fetched-at timestamp, model ID, structured field evidence/warnings. Visible to active members; changes follow event permissions. Do not retain raw website bodies by default.
- `audit_log`: ID, actor, action, entity type/ID, bounded change summary, request ID, timestamp. Append through trusted database triggers/functions; members cannot rewrite history. Admin read access initially. Preserve history when referenced records are deleted.

Date and location constraints: end >= start; nonblank bounded title; allowed enum values; both coordinates present or both absent; latitude -90..90 and longitude -180..180. Audit timestamps use `timestamptz`, independently of date-only event fields.

Create indexes on foreign keys and actual period/filter queries: active-event dates, category, tag-to-event lookup, and membership authorization. Add a date-range GiST index if measured overlap queries warrant it. Query only the selected window and needed fields; derive counts from the same filtered dataset/query contract.

Overlap rule for inclusive selection: `start_date <= selected_end AND end_date >= selected_start`. Parse date-only strings with date-only helpers rather than UTC conversion through `new Date('YYYY-MM-DD')` that can shift the visible day.

### 4.3 Database authorization and integrity

- Enable RLS on every exposed application table and configure least-privilege grants. Anonymous users have no event access.
- Shared calendar rows are accessible to all active, verified Slidely members, not only their creators.
- Database helper verifies `auth.uid()`, trusted current email/domain/confirmation, and active membership. Keep privileged helpers narrow, fix their search path, restrict execution, and avoid recursive membership policies.
- First successful verified domain login provisions membership through a controlled DB mechanism; new users cannot supply their own role or active flag.
- Members can read/create/edit and soft-delete events. Admins manage vocabulary, access, restore, and retention. If this permission proposal changes, update both UI and database rules.
- Define both existing-row (`USING`) and resulting-row (`WITH CHECK`) conditions where needed. Deny direct role escalation and forged creator/updater fields; use database-side actor attribution.
- Save event and tag links together in one transaction. Merge functions lock relevant records and recheck permissions before updating links and deleting the source vocabulary item.
- Database triggers maintain timestamps, versions, and audit entries. Check the supplied expected version to prevent lost updates.
- Public publishable keys are safe to expose only alongside correct RLS. Test attempted access through the Data API as well as through the UI.

### 4.4 File organization

```text
plan.md                              Project scope, status, decisions
README.md                            Local startup and service setup
.env.example                         Variable names and safe placeholders
.github/workflows/ci.yml              Automated checks
src/app/(auth)/login/                 Email and code screens
src/app/(workspace)/calendar/         Protected calendar route
src/app/(workspace)/settings/         Categories, tags, team access
src/app/api/                         Thin auth, enrichment, geocode handlers
src/components/ui/                   Shared accessible primitives
src/components/layout/               Header and permanent navigation
src/features/calendar/               Month/year views and selection state
src/features/events/                 Form, details, list, schemas, service
src/features/taxonomy/               Categories/tags and merge dialogs
src/features/map/                    Map, markers, location states
src/features/enrichment/             Extraction and field-evidence review
src/lib/auth/                        Session and authorization helpers
src/lib/supabase/                    Browser/server clients and DB types
src/lib/ai/                          Gemini adapter, prompt, output schema
src/lib/maps/                        Provider adapter and geocoding
src/lib/dates/                       Shared date-only and overlap helpers
src/lib/observability/               Request IDs and sanitized logging
src/design/                          Single-source tokens, typography roles, shared recipes
docs/design-system.md                Typography/palette rationale and usage rules
scripts/generate-theme.mjs           Generates CSS from the central design tokens
scripts/check-design.mjs             Guards against scattered visual definitions
supabase/migrations/                 Versioned SQL, indexes, RLS, functions
supabase/tests/                      Authorization and transaction checks
tests/e2e/                           Critical browser journeys
docs/                                Setup, decisions, debugging runbook
public/brand/                        Verified logo and permitted assets
```

Keep route handlers thin and feature rules close to their feature. Comment why a security/date/concurrency rule exists. Avoid comments that merely repeat the code and giant components mixing layout, prompts, queries, and permissions.

### 4.5 State, performance, and debugging

- URL owns selected period, view, search, and filter IDs. Details visibility and agenda anchors are transient UI state. Supabase owns saved data. Form state owns unsaved edits.
- Authenticate every mutation/handler, even when the page itself is protected. Validate input and provider output server-side.
- Do not put private user data in a global cache. Use request-scoped deduplication where useful; invalidate/revalidate affected data after mutations.
- Fetch independent initial datasets concurrently, defer the map bundle, and paginate long lists. Start simple; measure before adding another cache/state library.
- Error messages include a support/request ID and safe recovery action. Log operation, sanitized error code, duration, provider status, and request ID.
- Keep secrets and raw private data out of logs. Avoid full URL query strings that may contain tokens.
- Debugging runbook: failed build -> GitHub/Vercel build logs; failed save -> server request ID then Supabase logs/RLS; failed OTP -> Supabase Auth and SMTP logs; failed enrichment -> provider status/schema validation; missing pin -> location state/geocoding result.
- Use Vercel/Supabase logs initially; consider Sentry once usage justifies it. Configure reasonable retention and an owner for production alerts.

## 5. Beginner setup guide: your actions and Codex's actions

An account is the online service login. A repository is the saved code history. A deployment is a running copy of that code. Environment variables are settings/credentials stored outside code. You do not need to learn terminal commands first: Codex can prepare code and explain each checkpoint.

### Step 1: Create or identify company-owned accounts

You: use company-controlled GitHub, Supabase, Vercel, and Google AI Studio/Cloud accounts. Enable two-factor authentication for service administrators and retain recovery access. App users need only their Slidely email, not these service accounts.

Codex: check local Node.js LTS, package manager, and Git; install/setup only what is needed. Do not reinstall working tools unnecessarily.

Checkpoint: you can sign into each dashboard and know which organization owns the project. These accounts are separate from the app's OTP login.

### Step 2: Create the GitHub repository

You: repository URL supplied: `https://github.com/cebe-fyi/slidely-event-cal.git`. Confirm repository visibility is Private and authorize Git access through secure sign-in when needed. Repository contents/access have not yet been checked; this local folder has no configured remote as of the setup follow-up.

Codex: connect this existing repository, add ignores before any secrets exist, scaffold Next.js, and push the first working checkpoint. Use feature branches and pull requests for subsequent changes. No public repository is required.

Checkpoint: GitHub shows `plan.md`, app files, and a clean `.env.example`; no real credentials or `.env.local` are tracked.

### Step 3: Build a local visual prototype

Codex: create the branded layout and realistic synthetic events, including the mobile layout, filters, Month/List views and planned Map, and event-details overlays. Provide a local preview and simple launch instructions in README.

You: review layout, brand accuracy, and the month navigator. Account setup can continue independently.

Checkpoint: we agree on the working UI and date behavior before production data is involved.

### Step 4: Create Supabase projects

You: Supabase -> New project -> select organization -> create `slidely-events-dev` and a separate production project when preparing rollout. Choose the closest suitable available region for the team, subject to company data requirements. Save the database password securely.

You: in the project's Connect/API settings, locate project URL and publishable key. Enter values into the local environment file or secure settings with Codex's guidance. Never paste database passwords or secret/service-role keys into chat.

Codex: write migration files, apply them to development through the supported CLI/dashboard workflow, generate types, and verify RLS. If dashboard SQL is needed, supply the exact versioned migration and verification step; do not invent one-off untracked SQL.

Checkpoint: development data persists, anonymous access is denied, and the production database is untouched by test changes.

### Step 5: Configure OTP delivery and access

You: choose an email provider with SMTP support (for example an existing company provider or Resend). Verify a sender domain/subdomain via the provider's DNS records with whoever controls company DNS. Enter SMTP credentials directly into Supabase's custom SMTP settings.

Codex: configure email OTP code template, request/verification flow, expiry/resend behavior, exact-domain signup hook, member provisioning, and cookie refresh. Supply copy/paste configuration steps where dashboard interaction is required.

Supabase's default email delivery is intended for limited testing and restricts recipients; use custom SMTP before rolling out to the team. See [custom SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

You: first admin confirmed as `cebe@slidely.ai`. Test login with two team members and an outside-domain email. Check spam delivery and expiry behavior.

Checkpoint: a team member can receive a code, sign in, close/reopen the browser, and stay signed in; an outsider cannot read data or join.

### Step 6: Create Gemini and map credentials

You: in Google AI Studio, select/create a company-owned project and generate the Gemini API key; enable billing if the selected model/use requires it. Put it into secure environment settings, never into source code. Set available usage budgets/alerts.

You: if using Mapbox, create a company account and a public browser token restricted to the necessary website origins/scopes. Configure server geocoding access and permanent-storage capability as required by the selected plan. Set cost monitoring.

Codex: integrate provider adapters, keep secret keys server-only, handle quotas and timeouts, and test actual URL extraction and geocoding before choosing a production model/configuration.

Checkpoint: a real event URL yields editable fields with evidence; inaccessible pages and missing coordinates fail clearly without blocking manual entry.

### Step 7: Configure environment variables

Codex creates `.env.example` with placeholders and validates required configuration on startup. You enter actual values in `.env.local` on this computer and Vercel's environment settings. `.env.local` is ignored by Git.

- `NEXT_PUBLIC_SUPABASE_URL`: selected environment's project URL; browser-visible.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable client key; browser-visible, protected by RLS.
- `GEMINI_API_KEY`: secret; server-only.
- `GEMINI_MODEL`: tested model identifier; server configuration.
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: restricted public map token, if Mapbox is selected.
- `MAPBOX_GEOCODING_TOKEN`: server-side provider credential, if required by the selected integration.
- `APP_URL`: canonical URL for that environment, including `http://localhost:3000` locally.

SMTP secrets live in Supabase's SMTP settings. Supabase CLI access tokens/database credentials belong in secure local/CI secret storage if automated migrations need them. Do not expose them with `NEXT_PUBLIC_` names. No service-role key is required by the normal app design.

Checkpoint: Development, Preview, and Production each point to their intended services. Preview uses the development/test database and test-safe credentials; production credentials are scoped only to Production. Redeploy after changing build-time variables.

### Step 8: Connect Vercel to GitHub

Later, after local review and GitHub upload: Vercel -> Add New Project -> Import Git Repository -> authorize only the needed GitHub repository -> select `cebe-fyi/slidely-event-cal`. Use the Next.js framework preset and repository root. The current demo builds without environment variables; add service settings when those integrations are implemented. The app exists locally but has not been pushed yet.

Use a plan suitable for company/commercial usage; Vercel describes Hobby as personal/non-commercial. Check current [plan eligibility and pricing](https://vercel.com/pricing) rather than assuming the company's app belongs on a free personal plan.

Codex: configure production branch, build settings, and CI; check the first deployed build and logs. Feature branches receive preview URLs; production deploys from the chosen main branch after checks/review.

Checkpoint: a preview works with test data; production is wired to the separate production project. A private GitHub repository alone does not make a deployed website private; app authorization remains mandatory.

### Step 9: Set app URLs and optionally a custom domain

You: optionally add `events.slidely.ai` in Vercel Domains and have the DNS administrator add exactly the records Vercel supplies. A `vercel.app` URL is enough for initial testing.

Codex/you: set Supabase Auth Site URL to the canonical app URL and allow only the needed local and trusted callback/redirect URLs. Prefer a stable staging domain for auth testing rather than broad wildcard access for arbitrary previews. Verify HTTPS, OTP flow, and canonical URL after the change.

Checkpoint: team members can open the intended URL on desktop and phone and authenticate successfully.

### Step 10: Pilot, back up, and launch

Codex: run checks in section 7, apply reviewed migrations to production, verify backup availability for the selected Supabase plan, and document a restore procedure. Check costs and provider quotas without assuming free tiers include production recovery guarantees.

You: try the pilot with a few team members, enter real events, confirm category ownership, and test a merge and restore with test records before broader rollout. Keep one named app owner and one backup administrator.

Checkpoint: production passes the launch checklist, and the team knows the URL and how to report an issue with its request ID.

## 6. Milestones and current status

- [x] P0: Capture scope, proposed data model, UX behavior, setup sequence, and reference skills in this file.
- [x] P0: Inspect website content and screenshot references; verify actual brand CSS tokens and assets during the design-system refinement.
- [x] P0: Install and read Vercel React best practices, Vercel web design guidelines, Supabase Postgres best practices, and Anthropic frontend design skills.
- [x] P1: Next.js scaffold and mock-data desktop/mobile prototype with month/year/list/panels, search, filters, and sample event editing. Official wordmark and live brand tokens verified. Central Slidely palette and Inter typography system implemented. Desktop and phone interaction checks passed.
- [ ] P2: Development Supabase, migrations, domain-restricted OTP, session persistence, membership and RLS tests.
- [ ] P3: Persistent event CRUD, search/filters, concurrency handling, categories/tags including atomic merge/delete, audit/recovery. Sidebar Trash navigation is intentionally removed; any future recovery UI must respect that decision.
  - Local prototype subset: events/categories/tags persist in this browser, vocabulary create/edit/recolor/merge/delete is implemented, and trash/restore is available. Shared persistence, server authorization, audit history, and multi-user conflict handling are still pending; this does not complete P3.
- [ ] P4: Gemini enrichment with evidence review, failure states, rate limits, and manual fallback.
- [ ] P5: Map/geocoding integration, shared filters, clusters, and online/unlocated-event behavior.
- [ ] P6: GitHub CI, Vercel previews/production, SMTP/domain verification, production migration and backup setup.
- [ ] P7: Accessibility/mobile verification, team pilot, launch checklist, and operating runbook.

Complete one working slice at a time. A later milestone is not permission to omit a requested feature from the finished first release. Brand assets, account setup, and any environment blockers should be tracked here as they become concrete.

## 7. Verification and launch criteria

### Automated checks

- TypeScript, lint, production build, and focused domain tests in CI.
- Date tests: month/year boundaries, leap day, inclusive multi-day overlap, and identical calendar dates across browser timezones.
- Database tests: unauthenticated/outsider denied, active member allowed, deactivated member denied, roles protected, last-admin rule enforced, creator attribution trusted, and every exposed table covered.
- Transaction tests: tag/category merge keeps event associations without duplicates; deletion reassigns/unlinks correctly; failed saves roll back; stale edits report a conflict.
- Enrichment tests: malformed output, prompt-like website text, missing dates, unsafe URLs/redirects, quotas/timeouts, and private credentials never reaching the browser.
- Browser journeys: OTP login/logout/persistence, manual create/edit/trash/restore, date/filter consistency, AI review/save, and mobile navigation. Use controlled mocks for provider failures and real smoke checks for provider integration.

### Human acceptance

- [ ] Slidely branding visually verified; screenshot times/unrelated widgets excluded.
- [ ] Left sidebar stays visible; details overlay without resizing main content; List spans all dates and Home returns to today.
- [ ] Month/year/map display the same matching events and category colors.
- [ ] Multi-day and cross-year events behave correctly; online/unlocated events stay discoverable.
- [ ] Categories and tags support all requested management operations with an impact preview.
- [ ] A pasted event URL produces an editable review; manual entry works when AI cannot read a page.
- [ ] Only active verified Slidely members can access data, including direct API attempts.
- [ ] Browser restart preserves a valid session; logout and offboarding remove access.
- [ ] Two users editing the same event receive a safe conflict flow.
- [ ] Phone/keyboard use works; empty/error/loading states give useful next actions.
- [ ] Preview data is separate; no secrets in Git/client bundle/logs; production backup/restore procedure recorded.
- [ ] Service billing owner, usage alerts, app owner, and support/debug procedure established.

## 8. Practical best practices for building with AI

1. Ask for a small complete outcome: “Implement manual event editing with validation and verify it persists after refresh.” Large vague requests are harder to inspect and undo.
2. Keep this plan current. Ask for a short explanation of what changed, why, how it was verified, and what remains uncertain after every milestone.
3. Use a branch and a working Git checkpoint before risky changes. Review the preview before merging to the production branch. A successful generated response is not evidence that the app works.
4. Describe bugs with the exact page, action, expected result, actual result, and request ID/screenshot. Say “Saving an event after adding a tag shows this error,” rather than “It is broken.”
5. Keep one active implementation task on the same files. Conflicting simultaneous edits cause unnecessary breakage. Separate unrelated changes into separate commits.
6. Build with synthetic data in development. Never use the production database as a playground. Keep SQL changes in migrations and test permission rules directly.
7. Never paste real API keys/passwords into chat or commit them. Store them in local/Vercel/provider secret settings. Rotate a credential immediately if exposed.
8. Ask the agent to explain data-loss impact before deletion, destructive migrations, or bulk edits. Code rollback and database recovery are different: reverting Vercel does not undo database changes.
9. Verify uncomfortable cases: long titles, no events, inaccessible URLs, incorrect codes, duplicate events, missing locations, small screens, and simultaneous edits.
10. Use maintained skills and official documentation; verify package/model compatibility and lock versions. Avoid adding a dependency or service unless it solves a concrete need.
11. Keep logic separated and comments focused on intent. Readable names, small modules, input validation, request IDs, and migration history help debugging more than comments on every line.
12. Keep a named human owner for access, bills, backups, and release decisions. AI can implement and investigate, while you decide product behavior and confirm it fits the team's work.

## 9. Skills and authoritative references

Installed in the local Codex skills directory; available for automatic discovery on the next turn. Their instructions were read explicitly for this plan. No third-party skill scripts were executed beyond the trusted installer downloading the packages.

- [Vercel React best practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices): apply server-side authorization, scoped data fetching, and deferred map loading.
- [Vercel web design guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): use for implementation review of keyboard, focus, form, performance, and accessible UI behavior; no UI audit claimed before UI exists.
- [Supabase Postgres best practices](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices): apply RLS, constraints, migration discipline, query indexes, and concurrency handling.
- [Anthropic frontend design](https://github.com/anthropics/skills/tree/main/skills/frontend-design): apply an intentional Slidely-specific theme, calendar-first hierarchy, responsive layout, and restrained interaction design.

Supporting official documentation (checked during planning; recheck when implementing):

- [Supabase email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless) for the code template and verification flow.
- [Supabase Next.js SSR client](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs) for cookie/session refresh integration.
- [Supabase sessions](https://supabase.com/docs/guides/auth/sessions) for persistence and revocation behavior.
- [Supabase domain-restriction auth hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook) for signup control; use explicit deny-by-default for non-Slidely domains rather than blindly copying permissive sample logic.
- [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp) for production email delivery.
- [Gemini URL context](https://ai.google.dev/gemini-api/docs/url-context) for source retrieval and its limitations.
- [Vercel GitHub integration](https://vercel.com/docs/git/vercel-for-github) for Git-based deployments.
- [Vercel pricing](https://vercel.com/pricing) for company-use plan selection; no fixed cost estimate yet.
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) and [geocoding](https://docs.mapbox.com/api/search/geocoding/) for map rendering and stored-coordinate requirements.

## 10. Decision and progress log

- 2026-11-14: Initial plan created in an empty existing Git working directory. No app scaffold, schema, external projects, or deployments created yet.
- 2026-11-14: Selected a date-only shared-team design, one primary category plus multiple tags, explicit AI review, and database-enforced access as proposed implementation defaults.
- 2026-11-14: Installed/read four maintained development/design skills. Exact brand tokens, first admin, service ownership, SMTP, map billing, and production region remain open setup items.
- 2026-11-14: User supplied `cebe-fyi/slidely-event-cal` GitHub repository and confirmed `cebe@slidely.ai` as first admin, resolving the admin-identity question above. Remote connection, repository access/visibility verification, admin provisioning, and service connections remain pending.
- 2026-11-14: Created Next.js 16.4.6 / React 19.3.1 / TypeScript app, README, safe environment template, formatter, CI, date utilities/tests, calendar/year/list UI, and deployment guide at `/setup`. Added Git remote `origin` for the provided empty repository. Prototype is clearly labeled sample-only; edits reset on reload and no private/authenticated access is claimed.
- 2026-11-14: Browser checked desktop at 1440px and phone at 390px: year has twelve months, search narrows the list, invalid date range is rejected, sample save works, both panels reopen, mobile filters/list work, Escape dismisses the event dialog, no horizontal overflow or browser errors observed. Date unit tests pass (4). Final production verification recorded below when finished.
- 2026-11-14: Final lint, 4 date tests, production build, and strict TypeScript checks pass. npm audit reports zero vulnerabilities after a narrow patched minimatch override for TypeScript ESLint tooling. Real environment files and local screenshot artifacts are ignored by Git. Vercel deployment verification remains pending; the sample app needs no credentials to build.
- 2026-11-14: Initial app committed as `6a8bef9`. First push received GitHub 403: the computer's saved Git credential belongs to RishiSarangan, which cannot write to the provided repository. Started GitHub CLI device authorization for the correct account; no other account was signed out and global Git credentials were not replaced. Upload resumes after the user completes secure authorization.
- 2026-11-14: User requested local development before GitHub upload. Stopped the pending GitHub device authorization. No code was uploaded and no deployment was created.
- 2026-11-14: Added versioned browser-local workspace storage with validation, atomic category/tag changes including trashed-event associations, duplicate-name protection, merge/delete impact previews, recoverable event trash, and visible errors for failed storage. Added `Start calendar.cmd` for reopening without terminal commands. Exact local origin is `http://127.0.0.1:3000`; this browser-only storage is not shared or backed up.
- 2026-11-14: Verified category create/rename/duplicate rejection, impact preview and merge reassignment, local event save across reload, tag create/delete, trash/restore, and mobile management layout at 390px. Native dialog keyboard handling remains intact and browser error logs are empty. Production build, strict TypeScript, lint, and all 10 tests pass. Saved local screenshot in ignored `artifacts/calendar-local.jpg`. No push or deployment performed.
- 2026-11-14: User requested layout-only refinement while keeping local sample data: removed global navbar and preview banner, moved Slidely identity into the permanent full-height left sidebar, consolidated calendar controls into a compact toolbar, removed introductory heading and all left-collapse controls/state, retained right-panel collapse/reopen, and applied thin scrollbars throughout. Updated the responsive layout to retain a narrow permanent left rail. No service integrations, uploads, or sample-data changes included.
- 2026-11-14: Layout verified in-browser at desktop and 360/390px phone widths: left sidebar bounds start at y=0 and fill the viewport, no left-collapse controls exist, right collapse/reopen preserves the left rail, mobile list remains usable with a saved desktop right-collapse preference, and no horizontal overflow or browser errors were observed. TypeScript, lint, and production build pass. Preview screenshot: ignored `artifacts/calendar-layout.jpg`.
- 2026-11-14: Centralized all editable design values in `src/design/tokens.json`, generated CSS variables, semantic typography role assignments, shared component recipes, and TypeScript palette/icon accessors. Verified Slidely's named palette against live site CSS. Replaced arbitrary color selection with six Slidely options; legacy sample colors migrate while retaining names, IDs, dates, event associations, and trash. Added locally hosted Inter and its font license; type scale is limited to 12/14/16/20px with 400/500/600 weights. Added `docs/design-system.md`, a generation consistency check, and CI checks that reject scattered raw color/type/icon definitions. The app icon now uses Slidely's official logo mark. Eleven domain tests pass, including legacy-data preservation. Browser checks confirmed Inter loaded, intended type sizes, palette-only options, and no sidebar/dialog horizontal overflow at 390px. Local work only; no upload or deployment.
- 2026-11-14: Refined the left sidebar per user screenshots: 15% wider at each breakpoint, edge-to-edge dividers with tighter spacing, plain year between arrows, no View all year link, no Trash/promo/note/footer. Categories and tags now share + create controls, integrated colored checkboxes, period/search-aware facet counts, and hover/focus … menus with Edit/Merge/Delete. Uncategorized remains protected. Added shared Modal, FormField, ModalActions, FormModal, ConfirmModal and DropdownMenu components; migrated both vocabulary actions and event editing to them. A design check prevents feature-specific dialog shells. Merge requires a destination; deletion requires confirmation and keeps events. Browser verified create/edit/merge, delete cancellation and confirmation, autofocus/Escape behavior, 273.7px desktop rail (238px × 1.15), colored checkbox state, and mobile popup placement/width. Fifteen tests pass, including four new count tests. Production build passes. No GitHub push or deployment.
- 2026-11-14: Added a full-width divider below the Slidely brand/icon row and placed that row in the same grid track as the main toolbar. Desktop browser measurement confirms both dividers at y=64px. Logo and icon are vertically centered. Header height and sidebar insets now use shared layout tokens; month-grid outer edges exactly match filter-section content edges (20px desktop inset). Increased horizontal month spacing to the existing 32px spacing token and row gaps to 8px; narrow screens use the compact spacing scale. Local/sample-only refinement.
- 2026-11-14: Follow-up spacing refinement supersedes the large month gaps above: month buttons now fill the grid with a 4px gap and centralized 52px cell height, enlarging both hover and active surfaces. Right padding now includes the measured native scrollbar and sidebar border, while left insets are preserved. Counts and trailing +/…/profile icons align to the right content edge. ResizeObserver updates the scrollbar compensation as viewport/content changes. Browser measurement with a visible scrollbar found 20px left versus approximately 19.3px right (subpixel rounding), and month tiles about 75.4px wide × 52px high. Local/sample-only changes.
- 2026-11-14: User reversed the scrollbar-included spacing decision above. Sidebar content now has equal padding excluding the scrollbar (20px desktop, 8px phone); the brand row reserves the scrollbar lane separately for alignment. Row highlights provide equal breathing room around checkbox and action controls, with the ellipsis contained 4px inside the row edge. Browser verified matching overview/category/tag insets with a visible desktop scrollbar, mobile menu operation, and no horizontal page overflow at 390px. Local sample data retained; no push or deployment.

- 2026-11-14: Replaced persistent right list with shared right-side event-details modal (Close/Edit, fields, website and notes). List is the default main view, sorted/grouped by start date across all matching events. Home/Today returns to today; date/month/year navigation jumps to anchors without truncation. Month/Year remain available. Details become full-width on phones. Old collapse preferences are ignored. Design remains centralized. Local/sample-only work.
- 2026-11-14: Verified desktop main bounds are identical before/after details (1166.3px wide at 1440px viewport), keyboard opening preserves agenda scroll, Home aligns Today to the scroll viewport, edit/cancel returns to details, Month event click opens details, empty-search feedback is visible, and 390px mobile has no page/dialog overflow. Production build, TypeScript, lint, central design checks and all 15 existing domain tests pass.

- 2026-11-14: Removed Year view and its layout. Navigation is List/Month/Map (Map integration still pending). Month uses weekly date-range strips with noncolliding lanes, week-continuation edges and no event-label dots. Added shared event trigger/hover preview for Month and List, including keyboard focus/Escape and scroll/resize dismissal. Add/Edit now configure the same right-side Modal as preview. Mobile Month scrolls horizontally within its surface; event forms fill the viewport. Added four strip-layout tests for inclusive spans, overlap lanes, week/year boundaries and grid clipping; all 19 tests pass. Local sample data retained.

- 2026-11-14: Browser verified one 470.7px strip across columns 2–4 for the 10–12 November conference, no event-label dots, focus previews in both views, Add/Edit at the same 440px right-side placement as details, successful unchanged-event save back to preview, and 390px mobile page/form without horizontal overflow. Sidebar month dots retained. Production build, TypeScript, lint, design checks and 19 tests pass. No push or deployment.
