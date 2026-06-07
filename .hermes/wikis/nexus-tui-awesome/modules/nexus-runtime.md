# Module: `packages/nexus-runtime`

CLI routing, config resolution, and self-launch helpers. Handles argument normalization, feature availability checks, and ensures source and compiled binaries behave identically.

## Responsibilities

- CLI argument parsing and normalization (usage vs resume startup args)
- Feature availability checking: routes to help, version, sessions commands
- Mini-app command resolution: finds matching mini-app runners
- Self-launch path resolution: ensures source and binary use same entry point

## Key Files

- `src/cli/getCurrentNexusLaunchSpec.ts` — Determines current launch specification for self-launch
- `src/cli/getSourceEntrypointPath.ts` — Resolves source entry point for tsx runtime
- `src/cli/getTsxRuntimeBinaryPath.ts` — Gets tsx binary path for source execution
- `src/cli/normalizeResumeStartupArgs.ts` — Normalizes args for resumed sessions
- `src/cli/normalizeUsageStartupArgs.ts` — Normalizes args for new sessions
- `src/cli/resume/` — Session resume logic and state handling
- `src/config/ensureAgentDirEnv.ts` — Ensures agent directory env is set
- `src/clipboard-image/` — Clipboard image handling utilities

## Public API

### `getCurrentNexusLaunchSpec() → LaunchSpec`
Returns the current launch specification, ensuring source and binary behave identically.

### `getSourceEntrypointPath() → string`
Resolves the source entry point path for tsx runtime execution.

### `normalizeResumeStartupArgs(args: string[]) → NormalizedArgs`
Normalizes CLI arguments for resumed sessions.

### `normalizeUsageStartupArgs(args: string[]) → NormalizedArgs`
Normalizes CLI arguments for fresh usage sessions.

## Internal Structure

CLI helpers in `src/cli/`, config utilities in `src/config/`, clipboard handling in `src/clipboard-image/`. Small, focused modules with clear responsibilities.

## Dependencies

- **Uses:** `@nexus/types` (shared types)
- **Used by:** `apps/tui` CLI, `@nexus/mini-apps` (manifest resolution)

## Notable Patterns / Gotchas

- Self-launch path is critical for ensuring source and compiled binaries behave identically
- CLI argument normalization separates resume vs fresh usage paths
- No direct dependency on Pi — acts as abstraction layer over Pi internals
