# chrome-extension

- Source path: `src/chrome-extension`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/chrome-extension` holds the browser extension assets and native-host bridge used by annotate. This top level mixes 5 root files with 2 immediate component folders.

## Root entry files

- `src/chrome-extension/background.js`
- `src/chrome-extension/content.js`
- `src/chrome-extension/popup.html`
- `src/chrome-extension/popup.js`
- `src/chrome-extension/manifest.json`

## Component map

- [`icons`](./chrome-extension/icons.md) — files: `icon128.png`, `icon16.png`, `icon48.png`
- [`native`](./chrome-extension/native.md) — files: `host-wrapper.sh`, `host.cjs`, `install.sh`

## Read this first

1. `src/chrome-extension/manifest.json`
2. `src/chrome-extension/background.js`
3. `src/chrome-extension/native/host.cjs`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/extensions/annotate/SOURCE.md` says this browser-extension folder was copied from the upstream `pi-annotate` project.
