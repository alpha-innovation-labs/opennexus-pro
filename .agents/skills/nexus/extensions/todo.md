# extensions/todo

- Source path: `src/extensions/todo`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/todo` contains the bundled `todo` extension. In `feature-flags.json` it is currently marked `disabled`. At the root it has 2 files plus 4 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `false`
- Declared features:
  - todo modal
  - ctrl+\ shortcut

## Key files

- `src/extensions/todo/README.md`
- `src/extensions/todo/registerTodoExtension.ts`

## Immediate subareas

- `src/extensions/todo/model/`
- `src/extensions/todo/runtime/`
- `src/extensions/todo/storage/`
- `src/extensions/todo/ui/`

## Read this first

1. `src/extensions/todo/README.md`
2. `src/extensions/todo/registerTodoExtension.ts`
3. `src/extensions/todo/ui/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/extensions/todo/README.md` says this is a project-scoped todo modal opened with `Ctrl+\` and split into `model/`, `storage/`, `runtime/`, and `ui/`.
