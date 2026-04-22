# extensions/clipboard-image-paste

- Source path: `src/extensions/clipboard-image-paste`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/clipboard-image-paste` contains the bundled `clipboard-image-paste` extension. In `feature-flags.json` it is currently marked `enabled`. It is a leaf folder with 1 file and no nested directories.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - macOS ctrl+v image paste fallback for release builds

## Key files

- `src/extensions/clipboard-image-paste/registerClipboardImagePasteExtension.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `src/extensions/clipboard-image-paste/registerClipboardImagePasteExtension.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
- `feature-flags.json` describes this extension as the macOS `Ctrl+V` image-paste fallback for release builds.
- `AGENTS.md` marks it as a temporary release workaround that should stay in place until the native Pi/Bun release path is proven again.
