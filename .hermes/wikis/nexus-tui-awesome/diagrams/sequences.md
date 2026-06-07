# Sequence Diagrams

## Workflow: Source Mode Startup

When running `just dev`, the source entry point boots the CLI and runtime with source-mode extensions.

```mermaid
sequenceDiagram
    participant User
    participant index.ts
    participant runCli
    participant runCliWithApp
    participant runApp
    participant ExtensionFactories
    participant PiTUI
    
    User->>index.ts: runs `just dev`
    index.ts->>runCli: import runCli
    runCli->>runCliWithApp: delegates to CLI handler
    runCliWithApp->>runApp: delegates to source runtime
    runApp->>ExtensionFactories: createBundledExtensionFactories()
    ExtensionFactories-->>runApp: returns source extension factories
    runApp->>PiTUI: runAppWithExtensionFactories(factories)
    PiTUI->>PiTUI: initialize CLI, render startup screen
    PiTUI-->>User: TUI ready
```

### Walkthrough

1. **User input** — [`apps/tui/src/index.ts`](../../../apps/tui/src/index.ts)
2. **CLI delegation** — [`runCli.ts`](../../../apps/tui/src/cli/runCli.ts)
3. **Runtime boot** — [`runApp.ts`](../../../apps/tui/src/runtime/runApp.ts) loads source extensions

## Workflow: Release Binary Startup

When running the compiled binary, pre-compiled extension factories are used for optimized startup.

```mermaid
sequenceDiagram
    participant User
    participant index.release.ts
    participant runBundledApp
    participant CompiledFactories
    participant runAppWithExt
    
    User->>index.release.ts: runs compiled binary
    index.release.ts->>runBundledApp: import runBundledApp
    runBundledApp->>CompiledFactories: createCompiledBundledExtensionFactories()
    CompiledFactories-->>runBundledApp: returns pre-compiled factories
    runBundledApp->>runAppWithExt: runAppWithExtensionFactories(factories)
    runAppWithExt->>runAppWithExt: initialize CLI, render startup screen
    runAppWithExt-->>User: TUI ready
```

### Walkthrough

1. **User input** — [`apps/tui/src/index.release.ts`](../../../apps/tui/src/index.release.ts)
2. **Compiled factories** — [`runBundledApp.ts`](../../../apps/tui/src/runtime/runBundledApp.ts)
3. **Shared runtime** — [`runAppWithExtensionFactories.ts`](../../../apps/tui/src/runtime/runAppWithExtensionFactories.ts)

## Workflow: CLI Command Routing

When a user types a CLI command (e.g., `/help`, `/sessions`, `/install`), it's routed through the CLI router.

```mermaid
sequenceDiagram
    participant User
    participant runCliWithApp
    participant FeatureCheck
    participant MiniAppRegistry
    participant MiniAppRunner
    
    User->>runCliWithApp: types /help
    runCliWithApp->>FeatureCheck: isCliFeatureAvailable("help")
    FeatureCheck-->>runCliWithApp: true
    runCliWithApp->>runCliWithApp: printNexusUsage()
    
    User->>runCliWithApp: types /mini-apps start social-chat
    runCliWithApp->>MiniAppRegistry: findMiniAppCommand("social-chat")
    MiniAppRegistry-->>runCliWithApp: manifest
    runCliWithApp->>MiniAppRegistry: findMiniAppRunnerCommand("social-chat")
    MiniAppRegistry-->>runCliWithApp: runner path
    runCliWithApp->>MiniAppRunner: spawn detached worker
    MiniAppRunner-->>runCliWithApp: started
    runCliWithApp-->>User: "social-chat daemon started"
```

### Walkthrough

1. **CLI routing** — [`runCliWithApp.ts`](../../../apps/tui/src/cli/runCliWithApp.ts)
2. **Feature gating** — `src/cli/features/isCliFeatureAvailable.ts`
3. **Mini-app resolution** — `findMiniAppCommand` / `findMiniAppRunnerCommand` from `@nexus/mini-apps`

## Workflow: Mini-App Daemon Lifecycle

When a mini-app daemon is started, it spawns a detached worker, persists state, and monitors heartbeats.

```mermaid
sequenceDiagram
    participant CLI
    participant MiniAppManager
    participant SQLite
    participant Worker
    participant Heartbeat
    
    CLI->>MiniAppManager: startDaemon("social-chat")
    MiniAppManager->>SQLite: load manifest from registry
    SQLite-->>MiniAppManager: manifest
    MiniAppManager->>SQLite: persist state file
    SQLite-->>MiniAppManager: state persisted
    MiniAppManager->>Worker: spawn detached process
    Worker->>Heartbeat: write heartbeat file
    Heartbeat-->>Worker: heartbeat written
    Worker-->>MiniAppManager: process started
    MiniAppManager-->>CLI: daemon started
    
    CLI->>MiniAppManager: stopDaemon("social-chat")
    MiniAppManager->>Heartbeat: monitor heartbeat
    Heartbeat-->>MiniAppManager: heartbeat alive
    MiniAppManager->>Worker: send SIGTERM
    Worker-->>Heartbeat: stop heartbeat
    Heartbeat-->>MiniAppManager: heartbeat dead
    MiniAppManager-->>CLI: daemon stopped
```

### Walkthrough

1. **Daemon start** — [`findMiniAppRunnerCommand`](../../../packages/mini-apps/src/registry/findMiniAppRunnerCommand.ts)
2. **SQLite persistence** — State files persisted to `~/.local/share/nexus/`
3. **Heartbeat monitoring** — Crash detection via heartbeat file checks
