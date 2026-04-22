# extensions/term-modal

- Source path: `src/extensions/term-modal`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/term-modal` contains the bundled `term-modal` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 2 files plus 7 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - persistent shell
  - /term commands
  - terminal shortcuts

## Key files

- `src/extensions/term-modal/registerTermModalExtension.ts`
- `src/extensions/term-modal/types.ts`

## Immediate subareas

- `src/extensions/term-modal/ansi/`
- `src/extensions/term-modal/buffer/`
- `src/extensions/term-modal/keybindings/`
- `src/extensions/term-modal/pty/`
- `src/extensions/term-modal/runtime/`
- `src/extensions/term-modal/scripts/`
- `src/extensions/term-modal/ui/`

## Read this first

1. `src/extensions/term-modal/registerTermModalExtension.ts`
2. `src/extensions/term-modal/pty/`
3. `src/extensions/term-modal/ui/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
