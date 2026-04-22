# extensions/kanban

- Source path: `src/extensions/kanban`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/kanban` contains the bundled `kanban` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 1 file plus 3 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - /extension command
  - two-pane task board modal
  - temporary in-loop and completed task data

## Key files

- `src/extensions/kanban/registerKanbanExtension.ts`

## Immediate subareas

- `src/extensions/kanban/command/`
- `src/extensions/kanban/data/`
- `src/extensions/kanban/modal/`

## Read this first

1. `src/extensions/kanban/registerKanbanExtension.ts`
2. `src/extensions/kanban/command/`
3. `src/extensions/kanban/data/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
