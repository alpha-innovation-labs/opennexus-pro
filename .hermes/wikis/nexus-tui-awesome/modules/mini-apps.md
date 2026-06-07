# Module: `packages/mini-apps`

Managed daemon lifecycle system. Handles mini-app manifests, CLI commands for lifecycle management, SQLite persistence, heartbeat monitoring, and detached worker spawning.

## Responsibilities

- Mini-app manifest management: parse, validate, and resolve manifest definitions
- CLI integration: expose user-facing lifecycle commands (`nexus mini-apps`)
- Daemon management: spawn detached workers, persist state/heartbeat/log files
- Graceful shutdown: signal handling for clean daemon stop

## Key Files

- `src/registry/MiniAppManifest.ts` — Mini-app manifest type definition
- `src/registry/findMiniAppCommand.ts` — Resolves CLI command for mini-app
- `src/registry/findMiniAppRunnerCommand.ts` — Finds runner command for mini-app
- `src/registry/getMiniAppManifests.ts` — Loads all mini-app manifests from registry
- `src/shared/` — Shared utilities for daemon management
- `src/social-automation/` — Scheduled prompt automation daemon
- `src/social-chat/` — Social chat daemon with SQLite persistence
- `src/annotate/` — Annotation daemon with CRUD operations

## Public API

### `getMiniAppManifests() → MiniAppManifest[]`
Returns all registered mini-app manifests from the registry.

### `findMiniAppCommand(name: string) → MiniAppManifest | undefined`
Finds a mini-app manifest by name for CLI routing.

### `findMiniAppRunnerCommand(name: string) → string | undefined`
Finds the runner command path for a mini-app daemon.

## Internal Structure

Registry in `src/registry/`, shared utilities in `src/shared/`, individual daemon implementations in `src/<daemon>/` directories. SQLite persistence for all daemons.

## Dependencies

- **Uses:** `@nexus/runtime` (self-launch helpers), `@nexus/observability` (telemetry)
- **Used by:** `apps/tui` CLI (mini-app command routing)

## Notable Patterns / Got-go

- Daemons use heartbeat files for crash detection, not process monitoring
- SQLite storage persists state across daemon restarts
- CLI commands route through `findMiniAppCommand` / `findMiniAppRunnerCommand`
- Daemon lifecycle: start → heartbeat check → graceful shutdown on stop
- Social chat and automation daemons use separate SQLite databases
