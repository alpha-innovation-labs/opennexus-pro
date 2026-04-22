# runtime/cli

- Source path: `src/runtime/cli`
- Parent: [`runtime`](../runtime.md)

## What this area covers

`src/runtime/cli` is the runtime `cli` slice. At the root it has 2 files plus 1 nested folder.

## Key files

- `src/runtime/cli/getCurrentNexusLaunchSpec.ts`
- `src/runtime/cli/normalizeResumeStartupArgs.ts`

## Immediate subareas

- `src/runtime/cli/resume/`

## Read this first

1. `src/runtime/cli/getCurrentNexusLaunchSpec.ts`
2. `src/runtime/cli/normalizeResumeStartupArgs.ts`
3. `src/runtime/cli/resume/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/runtime/cli/getCurrentNexusLaunchSpec.ts` is the key file when a nested Nexus process needs to relaunch the current source or bundled executable.
