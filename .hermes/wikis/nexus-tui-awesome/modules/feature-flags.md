# Module: `packages/feature-flags`

Feature flag registry and runtime evaluation. Loads `feature-flags.json`, provides per-extension feature lists, and manages enabled/disabled state at runtime.

## Responsibilities

- Load and parse `feature-flags.json` from project root
- Provide per-extension feature lists and categories
- Manage enabled/disabled state per extension and feature
- Support `devOnly` and `category` filtering

## Key Files

- `packages/feature-flags/src/` — Runtime flag evaluation utilities
- `feature-flags.json` — Central feature flag registry (377 lines, 30+ extensions)

## Public API

### Feature Flag Registry
`feature-flags.json` defines all extensions with: `enabled` (boolean), `features` (string[]), `category` (string), `devOnly` (boolean, optional).

### Runtime Evaluation
Helper functions read from the registry and provide:
- `isExtensionEnabled(extensionName) → boolean`
- `getExtensionFeatures(extensionName) → string[]`
- `getEnabledExtensions() → string[]`

## Internal Structure

Small module focused on flag loading and evaluation. Configuration file is the single source of truth.

## Dependencies

- **Uses:** No runtime dependencies (pure config loader)
- **Used by:** All extension packages, `apps/tui` (feature gating), `@nexus/mini-apps` (manifest resolution)

## Notable Patterns / Gotchas

- Feature flags are compiled at build time into extension factories
- `devOnly: true` extensions are stripped from release builds
- Categories: `extension`, `pro`, `dev`, `mini-app`
- 30+ extensions defined with granular feature lists
