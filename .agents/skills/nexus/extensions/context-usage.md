# extensions/context-usage

- Source path: `src/extensions/context-usage`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/context-usage` contains the bundled `context-usage` extension. In `feature-flags.json` it is currently marked `enabled`. It is a leaf folder with 2 files and no nested directories.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - context_usage tool for current chat context window usage

## Key files

- `src/extensions/context-usage/registerContextUsageExtension.ts`
- `src/extensions/context-usage/formatContextUsage.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `src/extensions/context-usage/registerContextUsageExtension.ts`
2. `src/extensions/context-usage/formatContextUsage.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
