# extensions/annotate

- Source path: `src/extensions/annotate`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/annotate` contains the bundled `annotate` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 4 files plus 6 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - annotate command
  - annotate tool
  - chrome extension bridge

## Key files

- `src/extensions/annotate/SOURCE.md`
- `src/extensions/annotate/registerAnnotateExtension.ts`
- `src/extensions/annotate/constants.ts`
- `src/extensions/annotate/types.ts`

## Immediate subareas

- `src/extensions/annotate/command/`
- `src/extensions/annotate/format/`
- `src/extensions/annotate/guards/`
- `src/extensions/annotate/host/`
- `src/extensions/annotate/runtime/`
- `src/extensions/annotate/tool/`

## Read this first

1. `src/extensions/annotate/SOURCE.md`
2. `src/extensions/annotate/registerAnnotateExtension.ts`
3. `src/extensions/annotate/tool/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/extensions/annotate/SOURCE.md` states that the extension logic was imported from the upstream `pi-annotate` project and split into one-function-per-file modules in this repo.
