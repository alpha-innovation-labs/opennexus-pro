# extensions/startup-hero

- Source path: `packages/extensions/src/startup-hero`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`packages/extensions/src/startup-hero` contains the bundled `startup-hero` extension. It renders the Nexus startup hero with the wordmark, version, tips, active skills count, and `AGENTS.md` status.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - show N logo, version, tips, and startup status

## Key files

- `packages/extensions/src/startup-hero/registerStartupHeroExtension.ts`
- `packages/extensions/src/startup-hero/startupHeroWidgetKey.ts`
- `packages/extensions/src/startup-hero/showStartupHero.ts`
- `packages/extensions/src/startup-hero/clearStartupHero.ts`
- `packages/extensions/src/startup-hero/buildStartupHeroLines.ts`
- `packages/extensions/src/startup-hero/getStartupHeroStatus.ts`
- `packages/extensions/src/startup-hero/getStartupHeroVersion.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `packages/extensions/src/startup-hero/registerStartupHeroExtension.ts`
2. `packages/extensions/src/startup-hero/showStartupHero.ts`
3. `packages/extensions/src/startup-hero/buildStartupHeroLines.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
