# extensions/notify

- Source path: `src/extensions/notify`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/notify` contains the bundled `notify` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 1 file plus 1 nested folder.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - desktop notification on agent completion
  - macOS submarine sound by default
  - NEXUS_NOTIFY_SOUND_CMD override

## Key files

- `src/extensions/notify/registerNotifyExtension.ts`

## Immediate subareas

- `src/extensions/notify/runtime/`

## Read this first

1. `src/extensions/notify/registerNotifyExtension.ts`
2. `src/extensions/notify/runtime/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
