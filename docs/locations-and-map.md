# Locations and Map

Verified on 14 November 2026. Local sample-data implementation; no Supabase changes.

## Libraries and provenance

- [`country-state-city`](https://github.com/harpreetkhalsagtbit/country-state-city): pinned 3.2.1, the latest stable npm version at verification. Official npm download API reported 690,210 downloads for 7–13 November 2026. Its latest publication is from September 2023, so “latest package” does not mean real-time city data. The library cites [countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database) as its data source. Package license: GPL-3.0; its license is retained in `docs/licenses/country-state-city.txt`. Keep this provenance when distributing derived files or revisiting deployment packaging.
- [Leaflet](https://leafletjs.com/download): pinned stable 1.9.4, with `@types/leaflet` 1.9.22. Leaflet 2 was prerelease at verification; the app uses the stable API. License text is retained in `docs/licenses/leaflet.txt`.
- The small `demo-places.json` fixture was extracted from the installed location package, using exact country/state/city matches. No user locations were geocoded or guessed.

## Architecture

The full geographic catalogue is imported only by `catalog.ts`, used by the Node route `/api/locations`. Countries return code/name pairs. Country-specific city queries are bounded to 100 results and report a total so the UI can prompt further search. Derived country caches are limited to 12 entries; responses have normal HTTP caching. City search is debounced and aborted when the country/query changes. Country selections clear city state; city identity includes country, state and name. The browser never downloads the full global city dataset.

`EventPlace` stores country code/name, state code/name, city and finite numeric latitude/longitude. `locationKind` distinguishes city, online and unknown. Human-readable `location` remains for existing calendars and legacy records. Browser storage version 1 accepts optional structured fields, validates coordinates/ranges, and preserves older records. Only exact known `sample-*` locations are upgraded automatically. Unknown legacy text stays unpinned until explicitly selected.

Map and pins use these saved coordinates. Pins represent city centres, not venue precision. Events at identical coordinates group into a numbered marker; its popup exposes every event. Different nearby cities are not yet proximity-clustered. Category/tag/search and month/full-year overlap filtering happen before map rendering. Online/unlocated events stay in their own list. All lists open the existing right-side details modal.

Leaflet loads only when Map opens. Its DOM/map/resize listeners clean up on unmount. Opening event details preserves map bounds; a changed dataset/filter refits results. Popup text is constructed with DOM text nodes rather than interpolated event HTML. Keyboard-labelled markers and a full readable event index provide alternatives to pointer interaction.

## Tiles and failure handling

The local demo uses `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with visible OpenStreetMap attribution. These external image requests reveal normal request metadata and map tile coordinates to the tile host; event titles/notes and country/city search queries are not sent there. No device geolocation permission is requested.

Follow the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/): visible attribution, normal browser caching and Referer, no bulk/offline tile downloads. This public service has no availability guarantee. Choose an appropriate provider/capacity before a larger rollout. Override `NEXT_PUBLIC_MAP_TILE_URL` and update attribution in `src/features/map/config.ts` together when changing the provider. No map key is needed for the current default.

Map errors keep event lists and pins usable and offer retry. Failed tile detection checks currently displayed images, excluding stale tiles from earlier map bounds. Longitude wrapping prevents invalid tile X coordinates beyond the world boundary. Do not remove attribution to make small screens fit; allow it to wrap.
