# commands

- Source path: `src/commands`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/commands` holds bundled command assets that ship with the app. Everything here is at the root level: 2 files and no immediate component folders.

## Root entry files

- `src/commands/getBundledCommandsPath.ts`
- `src/commands/nexus-git-commit.md`

## Component map

This folder has no immediate component directories.

## Read this first

1. `src/commands/getBundledCommandsPath.ts`
2. `src/commands/nexus-git-commit.md`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Because this folder has no immediate components, the root files are the full map.
- `src/commands/getBundledCommandsPath.ts` resolves bundled command assets through the runtime package path helpers.
