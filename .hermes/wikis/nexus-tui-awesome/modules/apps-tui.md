# Module: `apps/tui`

Core TUI application that boots the Nexus CLI and runtime. Handles argument parsing, CLI routing, extension loading, and the startup screen.

## Responsibilities

- Boot sequence: source mode vs release binary detection
- CLI argument parsing and flag routing (help, version, sessions, uninstall)
- Runtime initialization with extension factories
- Startup screen rendering and profile tracking

## Key Files

- [`apps/tui/src/index.ts`](../../../apps/tui/src/index.ts) — Source-mode entry point, imports `runCli`
- [`apps/tui/src/index.release.ts`](../../../apps/tui/src/index.release.ts) — Release binary entry, imports compiled extension factories
- [`apps/tui/src/cli/runCli.ts`](../../../apps/tui/src/cli/runCli.ts) — Main CLI runner, delegates to `runCliWithApp`
- [`apps/tui/src/cli/runCliWithApp.ts`](../../../apps/tui/src/cli/runCliWithApp.ts) — Full CLI handler: 14 subcommands, mini-app resolution, feature gating
- [`apps/tui/src/runtime/runApp.ts`](../../../apps/tui/src/runtime/runApp.ts) — Source-mode runtime, loads bundled extensions
- [`apps/tui/src/runtime/runAppWithExtensionFactories.ts`](../../../apps/tui/src/runtime/runAppWithExtensionFactories.ts) — Core app runner with extension factory injection
- [`apps/tui/src/runtime/runBundledApp.ts`](../../../apps/tui/src/runtime/runBundledApp.ts) — Release-mode runtime with pre-compiled extensions

## Public API

### `runCli(argv: string[]) → Promise<number>`
CLI entry point. Parses flags, routes to subcommands (help, version, sessions, uninstall, etc.), returns process exit code.

### `runCliWithApp(argv: string[]) → Promise<void>`
Full CLI handler. Resolves mini-app commands, checks feature availability, prints usage, handles observations.

### `runApp(argv: string[]) → Promise<void>`
Source-mode app runner. Creates bundled extension factories from source and launches runtime.

### `runBundledApp(argv: string[]) → Promise<void>`
Release-mode app runner. Uses compile-time-selected extension factories for optimized startup.

## Internal Structure

CLI subcommands are organized by feature in `src/cli/`: `chat-status/`, `delete-session/`, `extensions/`, `features/`, `help/`, `install/`, `observations/`, `print/`, `sessions/`, `steer/`, `system-prompt/`, `uninstall/`, `version/`.

Runtime components live in `src/runtime/`: `annotations-daemon/`, `exit-message/`, `extensions/`, `harness/`, `startup-profile/`, `startup-screen/`.

## Dependencies

- **Uses:** `@nexus/runtime` (config, CLI resume), `@nexus/observability` (telemetry), `@nexus/mini-apps` (manifest resolution)
- **Used by:** Root package scripts, release build process

## Notable Patterns / Gotchas

- Release mode pre-selects extensions at compile time via `generate:feature-flags`, eliminating runtime evaluation
- Two entry points (`index.ts` / `index.release.ts`) allow source and binary to coexist with different extension paths
- `runAppWithExtensionFactories` is the shared runtime path used by both modes
