# extensions/workspace

- Source path: `src/extensions/workspace`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/workspace` contains the bundled `workspace` extension. In `feature-flags.json` it is currently marked `disabled`. At the root it has 6 files plus 1 nested folder.

## Feature-flag summary

- Enabled in `feature-flags.json`: `false`
- Declared features:
  - session switcher
  - ctrl+; shortcut
  - workspace top bar

## Key files

- `src/extensions/workspace/README.md`
- `src/extensions/workspace/registerWorkspaceExtension.ts`
- `src/extensions/workspace/formatSessionLabel.ts`
- `src/extensions/workspace/showSessionsModal.ts`
- `src/extensions/workspace/WorkspaceSessionsModal.ts`
- `src/extensions/workspace/primeSessionsShortcut.ts`

## Immediate subareas

- `src/extensions/workspace/top-bar/`

## Read this first

1. `src/extensions/workspace/README.md`
2. `src/extensions/workspace/registerWorkspaceExtension.ts`
3. `src/extensions/workspace/primeSessionsShortcut.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/extensions/workspace/README.md` explains the `ctrl+;` -> `/sessions` -> Neo-editor auto-submit workaround used because shortcut context does not expose `switchSession()`.
