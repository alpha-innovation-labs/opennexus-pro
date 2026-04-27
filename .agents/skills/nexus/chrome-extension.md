# chrome-extension

- Source path: `apps/chrome-extension`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`apps/chrome-extension` holds the browser extension assets and native-host bridge used by annotate. This top level mixes 5 root files with 2 immediate component folders.

## Root entry files

- `apps/chrome-extension/background.js`
- `apps/chrome-extension/content.js`
- `apps/chrome-extension/popup.html`
- `apps/chrome-extension/popup.js`
- `apps/chrome-extension/manifest.json`

## Component map

- [`icons`](./chrome-extension/icons.md) — files: `icon128.png`, `icon16.png`, `icon48.png`
- [`native`](./chrome-extension/native.md) — files: `host-wrapper.sh`, `host.cjs`, `install.sh`

## Read this first

1. `apps/chrome-extension/manifest.json`
2. `apps/chrome-extension/background.js`
3. `apps/chrome-extension/native/host.cjs`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/extensions/annotate/SOURCE.md` says this browser-extension folder was copied from the upstream `pi-annotate` project.
