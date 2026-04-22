# extensions/exit-message

- Source path: `src/extensions/exit-message`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/exit-message` contains the bundled `exit-message` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 3 files plus 1 nested folder.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - print session title on app exit

## Key files

- `src/extensions/exit-message/registerExitMessageExtension.ts`
- `src/extensions/exit-message/formatExitMessage.ts`
- `src/extensions/exit-message/updateExitMessageFromSessionTitle.ts`

## Immediate subareas

- `src/extensions/exit-message/state/`

## Read this first

1. `src/extensions/exit-message/registerExitMessageExtension.ts`
2. `src/extensions/exit-message/formatExitMessage.ts`
3. `src/extensions/exit-message/updateExitMessageFromSessionTitle.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
