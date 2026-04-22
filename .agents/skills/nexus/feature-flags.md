# feature-flags

- Source path: `src/feature-flags`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/feature-flags` holds the extension availability registry and the helpers that read and apply it. This top level mixes 12 root files with 1 immediate component folder.

## Root entry files

- `src/feature-flags/index.ts`
- `src/feature-flags/registerEnabledExtensions.ts`
- `src/feature-flags/createExtensionFeatureFlagReport.ts`
- `src/feature-flags/createExtensionFeatureFlags.ts`
- `src/feature-flags/createExtensionRegisterMap.ts`
- `src/feature-flags/applySystemExtensionAvailability.ts`
- `src/feature-flags/readFeatureFlagsConfig.ts`
- `src/feature-flags/readJsonFeatureFlagsConfig.ts`
- `src/feature-flags/getBundledFeatureFlagsConfig.ts`
- `src/feature-flags/getEnabledExtensionFeatureFlags.ts`
- `src/feature-flags/getFeatureFlagsConfigPath.ts`
- `src/feature-flags/types.ts`

## Component map

- [`generated`](./feature-flags/generated.md) — files: `compiledFeatureFlags.ts`

## Read this first

1. `src/feature-flags/index.ts`
2. `src/feature-flags/createExtensionFeatureFlags.ts`
3. `src/feature-flags/registerEnabledExtensions.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/feature-flags/registerEnabledExtensions.ts` iterates the registry and registers only the extensions whose flags remain enabled.
- The root `feature-flags.json` file is the human-edited extension inventory; `generated/` holds build artifacts for compiled paths.
