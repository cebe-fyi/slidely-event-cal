# Complete project on GitHub

Repository: https://github.com/cebe-fyi/slidely-event-cal

## Source and documentation on main

All application source, API routes, shared UI components, design tokens/styles, location/demo data, tests, package manifests/lockfile, scripts, CI configuration, brand assets, license notices and launch instructions are tracked in Git.

Project documents include `plan.md`, `README.md`, `AGENTS.md`, `docs/design-system.md`, `docs/locations-and-map.md`, this inventory, license texts and current screenshots in `docs/screenshots`.

## Generated files and preview history

The [complete project snapshot release](https://github.com/cebe-fyi/slidely-event-cal/releases/tag/project-snapshot-2026-11-14) provides:

- `slidely-generated-build.zip`: the generated `.next` folder, including production output, development output and cache, plus `tsconfig.tsbuildinfo`. A manifest records the source commit/build ID. The active process's `.next/dev/lock` is a transient operating-system lock and is omitted.
- `slidely-ui-preview-history.zip`: all local project preview JPGs from `artifacts`, including earlier calendar, sidebar, event-form and map iterations.
- `SHA256SUMS.txt`: checksums for both archives.

Generated files are included as downloadable GitHub release assets rather than adding machine-generated caches to the source history. The release also offers GitHub's automatic source-code ZIP/tar downloads. To run a build snapshot, use its matching source, Node.js 22 and `npm ci`, extract the generated files into the source folder, then run `npm start`. It is not a standalone executable.

## Environment and machine state

The only environment file present in this project is `.env.example`, already tracked in Git. There are no private `.env`, `.env.local` or service-credential files to upload. The map demo requires no API key.

Installed `node_modules` dependencies are recreated from `package-lock.json` with `npm ci`. Git's internal `.git` metadata and browser-local event storage are not application files; the source repository contains the fictional seed events, while local browser edits remain in that browser.

The GitHub repository is public, so its source, documents and release downloads are publicly accessible.
