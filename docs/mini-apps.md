# Nexus mini-apps

Nexus uses two product categories in feature management:

- **Extensions** enhance the core Nexus session by adding tools, UI behavior, providers, telemetry, or integrations.
- **Mini-apps** provide standalone workflows with their own product surface. A mini-app may expose `nexus <mini-app>` commands, daemon lifecycle, durable storage, or a dedicated modal workflow.

A daemon is not the deciding boundary. Product isolation and standalone workflow value decide whether something is a mini-app.

## Current classification

### Extensions

| Feature | Reason |
| --- | --- |
| `ai-providers` | Adds provider login and credential support. |
| `cmux` | Integrates title/status notifications with cmux. |
| `context-usage` | Adds a context usage tool. |
| `dev` | Adds dev-only diagnostics and playground utilities. |
| `exit-message` | Enhances exit output. |
| `extension-manager` | Adds extension management UI. |
| `feature-management` | Adds `/features` management UI. |
| `fff` | Enhances read/grep/file autocomplete. |
| `neo-editor` | Enhances promptline, autocomplete, slash usage, image paste. |
| `notify` | Adds desktop completion notifications. |
| `observations` | Adds observation tracking/status. |
| `rtk` | Adds native file/search tools. |
| `slashusage` | Adds usage display/history. |
| `startup-hero` | Enhances startup UI. |
| `sub-agent-status-widget` | Enhances working-status UI. |
| `sub-agents` | Adds subagent execution capability. |
| `telemetry` | Adds runtime analytics and observability plumbing. |
| `tron` | Enhances message/tool/thinking UI. |

### Mini-apps

| Feature | Reason |
| --- | --- |
| `social-chat` | Own CLI lifecycle, detached daemon, and bundled social adapters. |
| `annotation` | Own CLI lifecycle, daemon API, and storage. |
| `annotate` | Own browser annotation capture workflow. |
| `md-editor` | Own editing workflow, modal UI, chats, diff acceptance. |
| `todo` | Own todo workflow. |

## Manifest flow

Mini-app command routing is owned by `packages/mini-apps`.

1. A mini-app exports a manifest with `id`, `label`, `features`, command matching, runner matching, a command handler, and an optional daemon runner.
2. `apps/tui` remains the Nexus CLI entrypoint.
3. The CLI reads bundled mini-app manifests and routes `nexus <mini-app>` to the matching manifest.
4. Daemon mini-apps relaunch the current Nexus executable with internal runner args, preserving source and installed-release behavior.

Social chat and annotation do not have app entrypoint packages. New daemon lifecycle work must use mini-app manifests instead of adding app entrypoints.
