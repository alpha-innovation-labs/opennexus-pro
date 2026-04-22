# runtime/config

- Source path: `src/runtime/config`
- Parent: [`runtime`](../runtime.md)

## What this area covers

`src/runtime/config` is the runtime `config` slice. At the root it has 10 files plus 1 nested folder.

## Key files

- `src/runtime/config/applyNexusConfigPatch.ts`
- `src/runtime/config/getAgentDirPath.ts`
- `src/runtime/config/getDefaultThemeName.ts`
- `src/runtime/config/getProjectConfigDirName.ts`
- `src/runtime/config/getProjectConfigDirPath.ts`
- `src/runtime/config/getProjectSettingsPath.ts`
- `src/runtime/config/getProjectThemesPath.ts`
- `src/runtime/config/ensureAgentDirEnv.ts`
- `src/runtime/config/expandHomePath.ts`
- `src/runtime/config/mergeSettings.ts`

## Immediate subareas

- `src/runtime/config/default-settings/`

## Read this first

1. `src/runtime/config/applyNexusConfigPatch.ts`
2. `src/runtime/config/ensureAgentDirEnv.ts`
3. `src/runtime/config/default-settings/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/runtime/config/applyNexusConfigPatch.ts` patches Pi so Nexus uses bundled defaults, `.nexus` project settings, and Nexus theme lookup.
