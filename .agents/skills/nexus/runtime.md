# runtime

- Source path: `src/runtime`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/runtime` holds bootstrapping code that prepares config, patches Pi, and launches the app. This top level mixes 3 root files with 7 immediate component folders.

## Root entry files

- `src/runtime/runApp.ts`

## Component map

- [`cli`](./runtime/cli.md) — files: `getCurrentNexusLaunchSpec.ts`, `normalizeResumeStartupArgs.ts`; subfolders: `resume/`
- [`clipboard-image`](./runtime/clipboard-image.md) — files: `readClipboardImageViaMacOsJxa.ts`, `types.ts`, `writeClipboardImageTempFile.ts`
- [`config`](./runtime/config.md) — files: `applyNexusConfigPatch.ts`, `ensureAgentDirEnv.ts`, `expandHomePath.ts`, `getAgentDirPath.ts`, `getDefaultThemeName.ts`, `getProjectConfigDirName.ts`, `getProjectConfigDirPath.ts`, `getProjectSettingsPath.ts`, `getProjectThemesPath.ts`, `mergeSettings.ts`; subfolders: `default-settings/`
- [`exit-message`](./runtime/exit-message.md) — files: `printExitMessage.ts`, `registerExitMessageProcessHandler.ts`
- [`extensions`](./runtime/extensions.md) — files: `resolveBundledExtensionFactories.ts`
- [`package`](./runtime/package.md) — files: `expandHomePath.ts`, `getBinaryPackageDir.ts`, `getConfiguredPackageDir.ts`, `hasBunBinaryMarker.ts`, `isBundledBinary.ts`, `resolveBundledAssetPath.ts`, `resolveInstalledDependencyPath.ts`; subfolders: `embedded-assets/`
- [`startup-profile`](./runtime/startup-profile.md) — files: `constants.ts`, `extractStartupProfileArgs.ts`, `logRunAppPhase.ts`, `setStartupProfileEnabled.ts`

## Read this first

1. `src/runtime/runApp.ts`

## Navigation notes

- Start with the root entry file when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- `src/runtime/runApp.ts` is the single app entry point: normalizes args, installs Nexus/Pi patches, resolves extensions, imports Pi, and calls `main()`.
