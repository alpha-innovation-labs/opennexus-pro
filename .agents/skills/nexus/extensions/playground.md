# extensions/playground

- Source path: `src/extensions/playground`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/playground` contains the bundled `playground` extension. In `feature-flags.json` it is currently marked `disabled`. At the root it has 3 files plus 4 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `false`
- Declared features:
  - playground modal
  - ctrl+i shortcut

## Key files

- `src/extensions/playground/registerPlaygroundExtension.ts`
- `src/extensions/playground/registerPlaygroundShortcut.ts`
- `src/extensions/playground/types.ts`

## Immediate subareas

- `src/extensions/playground/model/`
- `src/extensions/playground/rpc/`
- `src/extensions/playground/runtime/`
- `src/extensions/playground/ui/`

## Read this first

1. `src/extensions/playground/registerPlaygroundExtension.ts`
2. `src/extensions/playground/registerPlaygroundShortcut.ts`
3. `src/extensions/playground/types.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
