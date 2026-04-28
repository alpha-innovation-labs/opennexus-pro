# extensions/cmux

- Source path: `src/extensions/cmux`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/cmux` contains the bundled `cmux` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 3 files plus 2 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - sync session title to cmux pane title
  - notify cmux tab when pane is done
  - /cmux workspace shell session view

## Key files

- `src/extensions/cmux/registerCmuxExtension.ts`
- `src/extensions/cmux/notifyCmuxPaneCompletion.ts`
- `src/extensions/cmux/syncCmuxPaneTitle.ts`
- `src/extensions/cmux/command/registerCmuxCommand.ts`

## Immediate subareas

- `src/extensions/cmux/runtime/`
- `src/extensions/cmux/state/`

## Read this first

1. `src/extensions/cmux/registerCmuxExtension.ts`
2. `src/extensions/cmux/notifyCmuxPaneCompletion.ts`
3. `src/extensions/cmux/syncCmuxPaneTitle.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
