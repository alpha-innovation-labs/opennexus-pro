# Getting Started

## Prerequisites

- **Node.js** — Latest LTS version
- **Bun** — For compiled binary builds
- **Turborepo** — Monorepo build system
- **Pi CLI** — Parent TUI framework

## Installation

```bash
git clone https://github.com/alpha-innovation-labs/nexus-tui-awesome.git
cd nexus-tui-awesome
npm install
```

## First Run

```bash
just dev
```

This runs the source-mode TUI with all community extensions loaded from source TypeScript.

```bash
just dev gateway start
```

Start the background gateway for extended functionality.

## Common Workflows

### Development Mode

```bash
just dev
```

Run with source extensions for hot-reloading during development.

### Release Build

```bash
npm run build:binary
```

Compile a release binary with feature-flagged extensions pre-selected.

### CLI Commands

```bash
nexus help
nexus version
nexus sessions
nexus extensions
```

### Mini-App Management

```bash
nexus mini-apps start social-chat
nexus mini-apps stop social-chat
nexus mini-apps status
```

## Configuration

- **`feature-flags.json`** — Central feature flag registry controlling extension availability
- **`.nexus/`** — Project configuration directory (see `@nexus/runtime` docs)
- **`~/.local/share/nexus/agent/`** — Agent session storage and chat status
- **`~/.local/share/nexus/mini-apps/`** — Mini-app state files and heartbeats

## Where to Go Next

- Architecture: [architecture.md](architecture.md)
- Module reference: [README.md#module-map](README.md#module-map)
- Class diagram: [diagrams/class-diagram.md](diagrams/class-diagram.md)
- Sequence diagrams: [diagrams/sequences.md](diagrams/sequences.md)
