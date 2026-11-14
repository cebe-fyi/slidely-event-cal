# Slidely Events design system

## Where to change the design

All design definitions live in `src/design/`.

- `tokens.json` is the single editable source for colors, typography values, spacing, radii, shadows, effects, and icon sizes. Change a token here to update it everywhere.
- `theme.css` is generated from those tokens. Never edit it directly. `npm run dev` and `npm run build` regenerate it; `npm run design:generate` also does this explicitly.
- `typography.css` assigns semantic text roles to shared component selectors. It is the only place that assigns font sizes, weights, families, tracking, and line heights.
- `components.css` contains the shared recipes for buttons, inputs, dialogs, calendar cells, cards, sidebars, and responsive geometry. It consumes token variables rather than defining another palette or type scale.
- `system.ts` exposes the same palette and icon values to TypeScript. Components may bind a category's approved color or a dynamic week count; they must not invent visual values inline.
- `tokens.json` also defines base sidebar widths, the 1.15 width multiplier, and menu geometry. The sidebar is consistently 15% wider across desktop, tablet, and phone breakpoints.
- The brand row and main toolbar occupy the same grid row, so their bottom dividers stay aligned. Header height and sidebar insets are centralized layout tokens. The logo row, month overview, and filter sections consume the same inset for each breakpoint. Month tiles use the centralized 52px height with a thin 4px gap, so hover and selection surfaces fill their cells.
- Sidebar content uses equal left and right insets, excluding the scrollbar. A ResizeObserver measures the scrollbar lane only to align the brand row with the scrollable sections. Month overview, category and tag sections share the same inset token. Filter-row highlights extend equally around their contents, keeping the checkbox and trailing action inside the highlight. This measurement is runtime geometry, not a separate design value.

`src/app/globals.css` only imports the local font and these shared styles. Feature components contain markup, behavior, and references to the design system.

## Typography: one family, four sizes, three weights

Use locally hosted **Inter Variable**, with system sans-serif fallbacks. Only regular (400), medium (500), and semibold (600) are used. Do not use light, bold, italics, or uppercase as extra hierarchy for this app.

- **12px / caption:** dates inside calendar cells, event metadata, category/tag chips, weekday labels, counts, secondary/help text, and compact calendar event labels. These support the task rather than compete with event names. This is the minimum size.
- **14px / body:** event names, filter labels, ordinary reading text, form labels, input text, buttons, and settings tabs. This is the default reading/interaction size. Use regular for content and medium for interactive labels or event names.
- **16px / section:** selected month/year, sidebar panel titles, year navigation, month headings within year view, empty-state titles, and local settings headings. Use semibold because these orient the user within the current surface.
- **20px / heading:** dialog titles and the standalone setup page title. Use semibold with slightly tighter tracking. Reserve it for the highest heading on a surface; avoid marketing-sized headings in the calendar.

Body text uses 1.5 line height. Section/dialog headings use 1.4. Dates and counts use tabular numerals for stable alignment. Hierarchy comes from role, spacing, weight, and contrast; not a new size for every element.

Responsive layouts keep the same four sizes. Wrap labels, truncate dense event labels with their title available, or change the layout. Do not shrink text to 8–11px to make it fit.

## Slidely colors only

The values were verified against the rendered CSS custom properties on [Slidely.ai](https://slidely.ai/) on 14 November 2026. The app uses its named brand/context/mono color families, not generic Tailwind colors that merely happened to be present on the website.

- Neutrals: Slidely mono white, near-white surfaces, mono 500 for primary text/buttons, mono 400 for ordinary secondary text, mono 300 for metadata, and mono 75/100 for borders.
- Primary brand accent: Slidely orange. Orange 600 is used for small interactive accents/Today because it has more contrast than orange 500; orange 100 is the selected surface and orange 700 the text on that surface.
- Category/tag palette: Slidely blue, purple, orange, teal, yellow, and neutral. Every option references an entry in the same token file. The editor offers this palette instead of an arbitrary color picker.
- Errors: Slidely negative 700, with a subtle surface derived from negative 500. Positive confirmation: Slidely context teal. Status text still explains the meaning without relying only on color.
- Event labels use neutral text on the approved category background. Category dots and borders carry the category color. In particular, yellow is not used as small body text on a pale yellow background.

The official wordmark and logo mark remain image assets. Shadows/backdrops use neutral black transparency; the error surface uses an explicit brand-color mix defined in tokens. No independent warm beige, gray-green, or arbitrary event colors remain in component code.

Existing browser-saved categories/tags using the old palette are mapped to approved colors on read. Event dates, text, names, IDs, associations, and trash are preserved. The normalized palette is persisted on the next successful workspace save.

## Shared visual conventions

All modal UI uses `src/components/ui/modal.tsx`: `Modal` supplies one accessible shell with focus/Escape handling, shared headers, error placement and actions; `FormField` supplies consistent labeled inputs; `FormModal` configures create/edit from a field list; `ConfirmModal` configures merge/delete. The event form also consumes this shell and field/action components. Feature code must not create another `<dialog>` or implement its own modal chrome; the design check enforces that rule.

Sidebar row actions use the common `DropdownMenu`. It handles outside click, keyboard navigation, Escape, focus return, portal rendering, and viewport placement. Counts give way to the … trigger on hover/focus; touch devices display the trigger alongside the count. Categories and tags reuse one sidebar section/row recipe and a single colored checkbox, without a separate color dot.

- Use the spacing scale, primarily multiples of 4px. Half steps exist for compact labels, borders, and icon alignment.
- Use four radii: small 4px, medium 6px, large 8px, and dialog 12px. Circular dates/indicators use the explicit full-radius token.
- Buttons, inputs, cards, and dialogs share the same neutral borders, focus accent, spacing, and typography roles. Do not create a one-off visual variant for each feature.
- Icon sizes are limited to 12px inline, 16px control, 20px navigation, and 24px illustration. Import `icons` from `design/system.ts` instead of passing an invented numeric size.
- Thin scrollbars, visible focus, native dialog keyboard support, and reduced-motion behavior apply throughout.
- Layout geometry and breakpoints stay together in `components.css`. This preserves the permanent full-height left rail and the independently collapsible right event panel.

## Verification and future changes

Run `npm run design:check` after changing the design. It verifies the generated theme, four type sizes, three weights, valid palette references, and no hardcoded color/type/icon definitions in feature files. CI runs this check too.

When adding a component, reuse an existing recipe and typography role. Add a new token only when an existing one cannot express a meaningful product distinction. Explain that distinction here; do not silently expand the type scale or brand palette.

Visual direction is inspired by Notion's restrained hierarchy and shadcn's shared component conventions; this does not claim either product's exact design. The implementation follows [shadcn's semantic CSS-variable approach](https://ui.shadcn.com/docs/theming). Inter is distributed with its original font license in `public/brand/Inter-LICENSE.txt`.
