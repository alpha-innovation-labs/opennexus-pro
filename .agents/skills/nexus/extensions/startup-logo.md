# extensions/startup-logo

- Source path: `src/extensions/startup-logo`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/startup-logo` contains the bundled `startup-logo` extension. In `feature-flags.json` it is currently marked `enabled`. It is a leaf folder with 7 files and no nested directories.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - show N logo on fresh startup

## Key files

- `src/extensions/startup-logo/registerStartupLogoExtension.ts`
- `src/extensions/startup-logo/startupLogoWidgetKey.ts`
- `src/extensions/startup-logo/showStartupLogo.ts`
- `src/extensions/startup-logo/clearStartupLogo.ts`
- `src/extensions/startup-logo/hasResumeCliFlag.ts`
- `src/extensions/startup-logo/buildStartupLogoLines.ts`
- `src/extensions/startup-logo/shouldShowStartupLogo.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `src/extensions/startup-logo/registerStartupLogoExtension.ts`
2. `src/extensions/startup-logo/startupLogoWidgetKey.ts`
3. `src/extensions/startup-logo/showStartupLogo.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
