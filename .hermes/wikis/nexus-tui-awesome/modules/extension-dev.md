# Module: `packages/extensions-dev`

Development-only extensions for testing, debugging, and playground features. Only available when `devOnly: true` and never bundled in release builds.

## Responsibilities

- Dev modal: feature flag toggles, modal variant playground, tab/shift+tab cycling
- Telemetry runtime: runtime telemetry event toggles and debugging
- OH-my-PI LSP: development-mode language server integration
- Dev tooling: development feature management and testing utilities

## Key Files

- `src/dev/` — Dev modal with feature toggles and modal variant playground
- `src/feature-management/` — Runtime feature flag management utilities
- `src/oh-my-pi-lsp/` — LSP integration for development testing
- `src/telemetry-runtime/` — Runtime telemetry event toggle system

## Public API

### Extension Factories
Dev extensions export factories that are only registered when `feature-flags.json` has `devOnly: true` entries. These are stripped from release builds.

## Internal Structure

4 subdirectories organized by purpose: `dev/`, `feature-management/`, `oh-my-pi-lsp/`, `telemetry-runtime/`. Each is independent.

## Dependencies

- **Uses:** `@nexus/runtime` (config resolution)
- **Used by:** `apps/tui` runtime (dev extension factory, source-only)

## Notable Patterns / Gotchas

- Dev extensions have `devOnly: true` in feature flags and are excluded from release builds
- Dev modal supports tab cycling through modal variants for UX testing
- Telemetry runtime provides live event toggle toggles for debugging
