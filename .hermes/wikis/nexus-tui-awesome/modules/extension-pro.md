# Module: `packages/extensions-pro`

Pro-tier extensions gated behind feature flags and paid subscriptions. Contains CMUX integration, real-time knowledge tracking, and session observations.

## Responsibilities

- CMUX terminal multiplexer: sync session titles to cmux pane, notify tab on completion
- Observations: real-time knowledge tracking via RTK (Redux Toolkit) state management
- Feature-gated extensions that require active subscription

## Key Files

- `src/cmux/` — CMUX pane title sync and tab notifications
- `src/rtk/` — Redux Toolkit state management for feature tracking
- `src/observations/` — Session observation storage and retrieval

## Public API

### Extension Factories
Each subdirectory exports an extension factory. Factories are only registered when the corresponding feature is enabled in `feature-flags.json`.

## Internal Structure

Small pro extension set (3 subdirectories) compared to the larger community set. Each extension is independent and self-contained.

## Dependencies

- **Uses:** `@nexus/runtime` (config), `@nexus/mini-apps` (mini-app integration)
- **Used by:** `apps/tui` runtime (pro extension factory)

## Notable Patterns / Gotchas

- Pro extensions have `category: "pro"` in feature flags and require subscription
- CMUX integration depends on external tmux/pane configuration
- RTK state is shared with observations for real-time updates
