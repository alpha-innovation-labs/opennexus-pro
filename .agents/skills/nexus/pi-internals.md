# pi-internals

- Source path: `src/pi-internals`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/pi-internals` holds patches and hooks that customize upstream Pi behavior for Nexus. Everything here is at the root level: 12 files and no immediate component folders.

## Root entry files

- `src/pi-internals/applyCompactModeImagePatch.ts`
- `src/pi-internals/applyStartupChangelogSilencePatch.ts`
- `src/pi-internals/applyStartupUpdateSilencePatch.ts`
- `src/pi-internals/applyToolExecutionSpacingPatch.ts`
- `src/pi-internals/applyToolGroupCollapsePatch.ts`
- `src/pi-internals/applyWorkingLoaderSilencePatch.ts`
- `src/pi-internals/assistantMessageHook.ts`
- `src/pi-internals/config.ts`
- `src/pi-internals/sessionManager.ts`
- `src/pi-internals/theme.ts`
- `src/pi-internals/tools.ts`
- `src/pi-internals/userMessageHook.ts`

## Component map

This folder has no immediate component directories.

## Read this first

1. `src/pi-internals/applyCompactModeImagePatch.ts`
2. `src/pi-internals/applyStartupChangelogSilencePatch.ts`
3. `src/pi-internals/applyStartupUpdateSilencePatch.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Because this folder has no immediate components, the root files are the full map.
- These files are patch points around Pi startup, tool rendering, config, session management, and message hooks.
