---
name: nexus
description: Use this skill when you need a source-backed map of the Nexus codebase, especially the runtime boot flow, bundled extensions, and major subsystems.
---

# Nexus codebase reference

Use this skill when you need to understand the project in depth. It gives a two-level map of the current `src/` tree and points to one reference file per top-level folder and immediate component.

## How to use this skill

1. Start with the top-level folder doc that matches the area you are changing.
2. Use the component links below for the first drill-down only; each component doc tells you what files to read next.
3. Prefer the `Read this first` section in each doc before diving deeper into implementation details.

## Recommended reading order

1. [`runtime`](./runtime.md) for boot flow and process setup.
2. [`cli`](./cli.md) for the command-line entrypoints and switches.
3. [`extensions`](./extensions.md) and [`feature-flags`](./feature-flags.md) for bundled feature wiring.
4. [`pi-internals`](./pi-internals.md) for the upstream Pi patch layer.
5. [`gateway`](./gateway.md) and [`adapters`](./adapters.md) for long-lived external integrations.
6. The remaining folder docs for area-specific details.

## Source tree table of contents

- [`adapters`](./adapters.md)
  - [`discord`](./adapters/discord.md)
  - [`shared`](./adapters/shared.md)
  - [`telegram`](./adapters/telegram.md)
- [`chrome-extension`](./chrome-extension.md)
  - [`icons`](./chrome-extension/icons.md)
  - [`native`](./chrome-extension/native.md)
- [`cli`](./cli.md)
  - [`adapter`](./cli/adapter.md)
  - [`extensions`](./cli/extensions.md)
  - [`sessions`](./cli/sessions.md)
  - [`system-prompt`](./cli/system-prompt.md)
  - [`version`](./cli/version.md)
- [`commands`](./commands.md)
- [`extensions`](./extensions.md)
  - [`annotate`](./extensions/annotate.md)
  - [`clipboard-image-paste`](./extensions/clipboard-image-paste.md)
  - [`cmux`](./extensions/cmux.md)
  - [`context-usage`](./extensions/context-usage.md)
  - [`exit-message`](./extensions/exit-message.md)
  - [`fff`](./extensions/fff.md)
  - [`generated`](./extensions/generated.md)
  - [`kanban`](./extensions/kanban.md)
  - [`neo-editor`](./extensions/neo-editor.md)
  - [`notify`](./extensions/notify.md)
  - [`observations`](./extensions/observations.md)
  - [`playground`](./extensions/playground.md)
  - [`shared`](./extensions/shared.md)
  - [`startup-logo`](./extensions/startup-logo.md)
  - [`sub-agent-status-widget`](./extensions/sub-agent-status-widget.md)
  - [`sub-agents`](./extensions/sub-agents.md)
  - [`term-modal`](./extensions/term-modal.md)
  - [`todo`](./extensions/todo.md)
  - [`tron`](./extensions/tron.md)
  - [`workspace`](./extensions/workspace.md)
- [`feature-flags`](./feature-flags.md)
  - [`generated`](./feature-flags/generated.md)
- [`gateway`](./gateway.md)
  - [`commands`](./gateway/commands.md)
  - [`paths`](./gateway/paths.md)
  - [`process`](./gateway/process.md)
  - [`runner`](./gateway/runner.md)
  - [`shared`](./gateway/shared.md)
  - [`state`](./gateway/state.md)
- [`pi-internals`](./pi-internals.md)
- [`pi-slash-usage`](./pi-slash-usage.md)
  - [`model`](./pi-slash-usage/model.md)
  - [`providers`](./pi-slash-usage/providers.md)
  - [`runtime`](./pi-slash-usage/runtime.md)
  - [`shared`](./pi-slash-usage/shared.md)
  - [`store`](./pi-slash-usage/store.md)
  - [`ui`](./pi-slash-usage/ui.md)
- [`prompts`](./prompts.md)
  - [`base-system-prompt`](./prompts/base-system-prompt.md)
- [`runtime`](./runtime.md)
  - [`cli`](./runtime/cli.md)
  - [`clipboard-image`](./runtime/clipboard-image.md)
  - [`config`](./runtime/config.md)
  - [`exit-message`](./runtime/exit-message.md)
  - [`extensions`](./runtime/extensions.md)
  - [`package`](./runtime/package.md)
  - [`startup-profile`](./runtime/startup-profile.md)
- [`themes`](./themes.md)
- [`wterm-demo`](./wterm-demo.md)
  - [`browser`](./wterm-demo/browser.md)
  - [`config`](./wterm-demo/config.md)
  - [`html`](./wterm-demo/html.md)
  - [`pty`](./wterm-demo/pty.md)
  - [`server`](./wterm-demo/server.md)
  - [`socket`](./wterm-demo/socket.md)
  - [`ui`](./wterm-demo/ui.md)

## Scope of this pack

- This pack mirrors the current folders under `src/` and their immediate component directories only.
- It is meant for navigation and orientation, not as a replacement for the source files themselves.
- When a folder has a `README.md` or `SOURCE.md`, the corresponding reference doc points to it first.
