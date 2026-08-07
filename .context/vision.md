---
version: "1.0.0"
created: 2026-08-06
modified: 2026-08-06
---

# Nexus — Product Vision

## Mission Statement

Give developers a powerful, fully local AI coding terminal — no cloud APIs, no vendor lock-in, no data leaving the machine — combining coding, browsing, automation, and system management in one cohesive, offline-capable interface.

### What It Is

Nexus is a custom terminal UI application built on Pi that prioritizes local AI first — bundling 24 supported local LLM gateways (Ollama, vLLM, llama.cpp, MLX, LM Studio, LiteLLM, and more) alongside 24 inline extensions, mini-apps, and local infrastructure into a single distributable binary. While other AI harnesses treat local providers as an afterthought, Nexus builds its entire provider system around self-hosted inference servers, so users get full AI capability without cloud dependencies, API keys, or data leaving their machine.

## Features

### Local AI Providers

- As a developer who cares about privacy, I want all AI inference to run locally on my machine so that no code or prompts ever leave my hardware.
- As a power user, I want 24 supported local LLM gateways (Ollama, vLLM, llama.cpp, MLX, LM Studio, LiteLLM, etc.) auto-discovered at startup so that I can switch between models without configuring anything.
- As a team, I want Nexus to strip Pi's built-in cloud OAuth providers (Anthropic, OpenAI, Google, GitHub) and replace them with local-only gateways so that the default experience is fully offline.
- As an operator, I want explicit model catalogs per gateway so that Nexus prevents Pi from merging its cloud model catalog into local providers.

### Pi Packages

- As a developer, I want a `/pi-packages` command that lists all installed Pi packages so that I can audit what extensions and providers are available in my environment.

### Auto-Update

- As a user, I want Nexus to silently check for updates at the start of each session so that I stay current without being interrupted.

### CMux (Terminal Multiplexer)

- As a power user, I want Nexus to sync pane titles, track session state, and notify when CMux panes complete so that my multi-pane terminal workflow stays synchronized and visible.

### Context Usage

- As a developer, I want a `/context` command and a `context_usage` tool that show my current context-window usage in real time so that I can monitor token consumption and avoid hitting limits.

### Custom Tools (Agent E2E)

- As a developer, I want a `agent-e2e` tool that lets me set up test workspaces, start agents, send prompts, read output, and send keys so that I can programmatically test and control coding agents from the terminal.

### Exit Message

- As a user, I want Nexus to capture the current session resume command and title, then display a summary after shutdown so that I can see what just happened without scrolling back.

### Feature Management

- As an admin, I want a `/features` command that visualizes the hardcoded feature-flag registry so that I can inspect which extensions are bundled and their current state.

### FFF (Feature Flag Flags)

- As a developer, I want Nexus to override `read` and `grep` with a feature-flag-aware runtime so that I can control which features are active per session and per working directory.

### Herdr Agent End Log

- As a Herdr operator, I want Nexus to write the last assistant message to a per-pane state file and rename the Herdr tab to the session title when an agent ends so that I can track agent output across panes.

### Hotkeys

- As a power user, I want a `/hotkeys` command that shows, filters, and lets me edit all registered keybindings in a modal so that I can customize my terminal shortcuts.

### Local Image Reader

- As a developer, I want a `/local-image` command and a `local_image_reader` tool that lets me send local images to a multimodal model so that I can analyze, describe, or extract information from images directly in the terminal.

### Neo Editor

- As a user, I want a rich inline editor with startup resume support, config management, and editor triggers so that I can compose and edit content without leaving the TUI.

### Desktop Notifications

- As a user, I want Nexus to send desktop notifications for agent events so that I get alerted when long-running tasks complete without needing to watch the terminal.

### Observations

- As a developer, I want session observations — summaries, trackers, and commands — so that I can audit agent behavior, track skill invocations, and review transcripts after the fact.

### Prompts

- As a developer, I want a `/prompts` command that manages system prompts, prompt templates, and prompt commands so that I can control the AI's behavior and context.

### RTK (Runpod Toolkit)

- As an operator, I want a toolkit for managing cloud GPU inference (Runpod) — including usage tracking, pricing info, savings analysis, and a `/rtk` command — so that I can offload heavy inference to the cloud when local hardware falls short.

### Slash Menu

- As a user, I want a hierarchical `/` slash-command menu that lets me navigate models, settings, tools, sessions, themes, and resource commands in a multi-level modal so that I can control every aspect of Nexus without memorizing CLI flags.

### Startup Hero

- As a user, I want a polished startup screen that shows the Nexus version, enabled extensions, enabled mini-apps, and startup duration so that I get a branded, informative welcome on every launch.

### System Prompt Management

- As a developer, I want Nexus to apply a custom system prompt at startup so that the AI agent behaves according to my project-specific instructions and constraints.

### Tron Terminal

- As a power user, I want a `tron` terminal extension that provides additional terminal capabilities so that I can extend the base TUI with specialized workflows.

### Web Search

- As a developer, I want a `webtools` extension that searches the web using a Crawl4AI → Jina Reader → direct HTTP fetch pipeline, plus SearXNG integration and GitHub search so that I can find information without leaving the terminal.

### AI Coding Agent

- As a developer, I want a full-featured coding agent running inside my terminal with local AI by default so that I can write, debug, and iterate on code without leaving my workflow or connecting to the cloud.
- As a team, I want session persistence and observation logging so that I can audit and replay agent decisions.

### Mini-App Management

- As a user, I want lifecycle-managed mini-apps (start, stop, status, logs) accessible from the CLI so that background services like Telegram gateways or social daemons run reliably.
- As an operator, I want mini-app state, heartbeats, and logs persisted under the Nexus agent directory so that recovery and debugging are straightforward.
- As a developer, I want a manifest-driven mini-app system so that new daemons can be added without touching core CLI routing.

### Local Infrastructure Integration

- As an operator, I want Nexus to coexist with local Docker stacks (search engine, memory engine) so that AI agents have access to web search and long-term memory.
- As a developer, I want a self-relaunching CLI that spawns nested processes as the current Nexus binary so that dev and release behave identically.

## Constraints

- Nexus does not register any cloud AI providers by default — all built-in OAuth providers (Anthropic, OpenAI, Google, GitHub) are stripped at startup; only local gateways are available.
- Nexus does not require any API keys for local providers — gateways like Ollama work with no authentication.
- Nexus does not discover or load extensions dynamically — every bundled extension is declared in the hardcoded registry.
- Nexus does not surface Pi branding in any user-facing output (UI labels, startup text, version, help).
- Nexus does not support "nexus" as an agent type in Herdr — the release wrapper uses a mastracode hack to work around this limitation.
- Nexus does not write to `settings.json` or ad-hoc config files — all user-facing configuration goes through `~/.config/nexus/config.json` or `.nexus/config.json`.
- Nexus does not enable startup changelog or update promo content by default — these remain disabled unless explicitly re-enabled.

## Version History

### V1.0.0 (2026-08-06) [48ccb32]
**Type**: Major
**Changed**: Initial vision established
**Approved by**: [Role/Name]
**Impact**: Foundation for Nexus — 24 bundled extensions, 24 local LLM gateways, and a fully offline-capable AI coding terminal.
