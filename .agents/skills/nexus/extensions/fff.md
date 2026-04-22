# extensions/fff

- Source path: `src/extensions/fff`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/fff` contains the bundled `fff` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 2 files plus 6 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - FFF-backed read override
  - FFF-backed grep override
  - FFF-powered @ file autocomplete

## Key files

- `src/extensions/fff/index.ts`
- `src/extensions/fff/registerFffExtension.ts`

## Immediate subareas

- `src/extensions/fff/editor/`
- `src/extensions/fff/features/`
- `src/extensions/fff/grep/`
- `src/extensions/fff/read/`
- `src/extensions/fff/runtime/`
- `src/extensions/fff/shared/`

## Read this first

1. `src/extensions/fff/index.ts`
2. `src/extensions/fff/registerFffExtension.ts`
3. `src/extensions/fff/editor/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
