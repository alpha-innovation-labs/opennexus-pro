# Module: `packages/extension-core`

Community extensions bundled by default. Contains the largest extension set covering AI providers, editor enhancements, session management, and tool integrations.

## Responsibilities

- AI provider management: oh-my-pi provider, manual credential prompts, `/login` handler
- Editor integration: neo-editor (image paste via JXA/`osascript`)
- Session management: sub-agents, sub-agent status widgets, prompt queue, slash-menu
- Runtime utilities: auto-update checks, context-usage reporting, chat-status persistence
- System configuration: system-prompt injection, steer-queue for inference steering

## Key Files

- `src/ai-providers/` — Provider credential management and login flows
- `src/neo-editor/` — Image paste workaround using shared JXA clipboard runtime
- `src/sub-agents/` — Sub-agent orchestration and status tracking
- `src/slash-menu/` — Slash-command autocomplete and menu rendering
- `src/oh-my-pi-lsp/` — LSP integration for enhanced code intelligence
- `src/prompt-queue/` — Queued prompt management during inference
- `src/auto-update/` — Async npm version checking and update confirmation modal

## Public API

### Extension Factories
Each subdirectory exports an extension factory conforming to the Pi extension interface. Factories are registered at runtime via `createBundledExtensionFactories`.

### Key Types
- Extension factory objects with `onStart`, `onStop`, and feature hooks
- AI provider credential schemas for oh-my-pi and manual providers

## Internal Structure

30+ extension subdirectories organized by capability: `ai-providers/`, `ask-user-question/`, `auto-update/`, `chat-status/`, `context-usage/`, `exit-message/`, `fff/`, `generated/`, `hotkeys/`, `neo-editor/`, `notify/`, `pi-packages/`, `prompt-queue/`, `prompts/`, `runtime/`, `slash-menu/`, `slashusage/`, `startup-hero/`, `steer-queue/`, `sub-agent-status-widget/`, `sub-agents/`, `system-prompt/`, `tron/`, `web-search/`.

## Dependencies

- **Uses:** `@nexus/feature-flags` (runtime flag evaluation), `@nexus/runtime` (config helpers)
- **Used by:** `apps/tui` runtime, `packages/extensions-dev` (shared helpers)

## Notable Patterns / Gotchas

- `neo-editor` image paste is a temporary workaround; do not refactor until native Pi/Bun release works
- Extensions are imported from source in dev mode, compiled in release mode
- `generated/` directory contains auto-generated extension code from manifests
