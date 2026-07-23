# extensions/observations

- Source path: `src/extensions/observations`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/observations` contains the bundled `observations` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 1 file plus 5 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - observation tracking
  - /observations command

## Key files

- `src/extensions/observations/registerObservationsExtension.ts`

## Immediate subareas

- `src/extensions/observations/command/`
- `src/extensions/observations/shared/`
- `src/extensions/observations/summarizer/`
- `src/extensions/observations/tracker/`

## Read this first

1. `src/extensions/observations/registerObservationsExtension.ts`
2. `src/extensions/observations/command/`
3. `src/extensions/observations/shared/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
