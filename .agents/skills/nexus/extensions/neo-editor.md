# extensions/neo-editor

- Source path: `src/extensions/neo-editor`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/neo-editor` contains the bundled `neo-editor` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 7 files plus 5 nested folders.

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

- `src/extensions/neo-editor/editor-triggers/`
- `src/extensions/neo-editor/git/`
- `src/extensions/neo-editor/promptline/`
- `src/extensions/neo-editor/transport/`
- `src/extensions/neo-editor/ui/`

## Read this first

1. `src/extensions/neo-editor/registerNeoEditorExtension.ts`
2. `src/extensions/neo-editor/promptline/`
3. `src/extensions/neo-editor/editor-triggers/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
