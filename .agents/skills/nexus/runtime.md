# runtime

- Source path: `src/runtime`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/runtime` holds bootstrapping code that prepares config, patches Pi, and launches the app. This top level mixes 3 root files with 7 immediate component folders.

## Root entry files

- `src/runtime/runApp.ts`
- `src/runtime/runAppWithExtensionFactories.ts`
- `src/runtime/runBundledApp.ts`

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
2. `src/runtime/runAppWithExtensionFactories.ts`
3. `src/runtime/runBundledApp.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/runtime/runAppWithExtensionFactories.ts` is the main boot sequence: normalize args, install Nexus/Pi patches, resolve extensions, import Pi, then call `main()`.
- `src/runtime/runBundledApp.ts` switches the app to compile-time-selected release extensions.
