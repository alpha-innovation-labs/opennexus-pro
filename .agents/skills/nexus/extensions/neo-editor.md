# extensions/neo-editor

- Source path: `src/extensions/neo-editor`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/neo-editor` contains the bundled `neo-editor` extension. In `feature-flags.json` it is currently marked `enabled`. The extension is organized into `features/` for major UX features and `shared/` for support modules reused across those features.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - custom promptline
  - usage meter
  - @ file autocomplete
  - editor trigger submit
  - macOS ctrl+v image paste fallback

## Key files

- `src/extensions/neo-editor/registerNeoEditorExtension.ts`
- `src/extensions/neo-editor/readNeoConfig.ts`
- `src/extensions/neo-editor/getNeoConfigPath.ts`
- `src/extensions/neo-editor/primeStartupResumeModal.ts`
- `src/extensions/neo-editor/types.ts`
- `src/extensions/neo-editor/config.json`
- `src/extensions/neo-editor/editor-triggers.json`

## Immediate subareas

- `src/extensions/neo-editor/features/editor-triggers/`
- `src/extensions/neo-editor/features/help-shortcuts/`
- `src/extensions/neo-editor/features/menu/`
- `src/extensions/neo-editor/features/promptline/`
- `src/extensions/neo-editor/shared/git/`
- `src/extensions/neo-editor/shared/transport/`
- `src/extensions/neo-editor/shared/ui/`

## Read this first

1. `src/extensions/neo-editor/registerNeoEditorExtension.ts`
2. `src/extensions/neo-editor/features/promptline/`
3. `src/extensions/neo-editor/features/menu/`
4. `src/extensions/neo-editor/features/editor-triggers/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
