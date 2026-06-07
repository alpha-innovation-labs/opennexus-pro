# Nexus TUI

Custom Pi TUI app that bundles local extensions and manages a `.nexus/` project config directory. Provides a terminal-based AI chat interface with rich extension system, mini-app daemon management, and telemetry.

## Key Concepts

- **Extensions** — Modular features (ai-providers, neo-editor, sub-agents, etc.) gated by `feature-flags.json` and loaded at runtime
- **Mini-Apps** — Long-running daemons (social-chat, social-automation, annotate) managed via CLI commands with lifecycle persistence
- **Runtime Modes** — Source-mode (`just dev`) vs compiled release binary, each with different extension factory paths
- **Telemetry** — OpenTelemetry-based event tracking with configurable per-feature toggles, sent to PostHog

## Entry Points

- [`apps/tui/src/index.ts`](apps/tui/src/index.ts) — Source-mode entry, boots `runCli` for dev/development usage
- [`apps/tui/src/index.release.ts`](apps/tui/src/index.release.ts) — Release binary entry, selects bundled extension factories and launches `runBundledApp`

## High-Level Architecture

Nexus is a monorepo managed by Turborepo with 5 apps and 12 packages. The core TUI app (`apps/tui`) delegates CLI handling, session management, and extension loading to shared packages. Extensions are compiled from three sources: core (always bundled), dev (development-only features), and pro (paid features). Mini-apps run as managed daemons with SQLite persistence.

See [architecture.md](architecture.md).

## Module Map

| Module | Purpose |
|---|---|
| [`apps/tui`](modules/apps-tui.md) | Core TUI application — CLI, runtime, startup screen |
| [`packages/extension-core`](/modules/extension-core.md) | Community extensions — ai-providers, neo-editor, sub-agents, slash-menu |
| [`packages/extensions-pro`](modules/extension-pro.md) | Pro/feature-flagged extensions — cmux, observations, rtk |
| [`packages/extensions-dev`](modules/extension-dev.md) | Dev-only extensions — dev-modal, telemetry toggles, oh-my-pi-lsp |
| [`packages/nexus-runtime`](modules/nexus-runtime.md) | CLI routing, config resolution, self-launch path helpers |
| [`packages/mini-apps`](modules/mini-apps.md) | Mini-app daemon management — manifests, lifecycle, SQLite persistence |
| [`packages/observability`](modules/observability.md) | OpenTelemetry telemetry — event tracking, attributes, PostHog integration |
| [`packages/feature-flags`](modules/feature-flags.md) | Feature flag registry — enabled/disabled state per extension |
| [`packages/tui-kit`](modules/tui-kit.md) | Shared UI components — two-pane modal, picker overlays |
| [`packages/types`](modules/types.md) | Shared TypeScript type definitions across packages |

## Getting Started

See [getting-started.md](getting-started.md).
