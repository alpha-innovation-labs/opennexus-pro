# themes

- Source path: `src/themes`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/themes` holds bundled theme assets and the helper that locates them. Everything here is at the root level: 2 files and no immediate component folders.

## Root entry files

- `src/themes/getBundledThemesPath.ts`
- `src/themes/nexus-black.json`

## Component map

This folder has no immediate component directories.

## Read this first

1. `src/themes/getBundledThemesPath.ts`
2. `src/themes/nexus-black.json`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Because this folder has no immediate components, the root files are the full map.
- `src/themes/getBundledThemesPath.ts` resolves the packaged themes directory and falls back to a `themes/` suffix when needed.
