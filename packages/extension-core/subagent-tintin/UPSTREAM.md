# Upstream provenance

- Repository: https://github.com/tintinweb/pi-subagents
- Revision: `e955e29c51b7a6cce37e1108cd2d6c57a77e151c` (`master`)
- Upstream package: `@tintinweb/pi-subagents`, version `0.19.0`
- License: MIT; original notice retained in `LICENSE`.

## Original import boundaries

The original import copied `src/` (all 56 upstream source files), `docs/`, `examples/`, `README.md`, `LICENSE`, and `tsconfig.json` from the revision above. No upstream Git history, CI, development-agent configuration, tests, media, generated output, dependency trees, or npm lockfile were imported. These are historical import facts, not a claim that the current source tree or TypeScript configuration is unchanged.

`LICENSE` retains the original MIT notice. The upstream README, guides, and examples are reference material describing upstream installation and behavior, not Nexus activation.

## Current Nexus adaptations

Nexus maintains local presentation, input, and integration changes on top of that import. Representative package-relative surfaces include:

- `src/ui/shared-dialog.ts`, `src/ui/conversation-viewer.ts`, and `src/ui/workflow-dialog.ts`: shared modal framing, navigation, and responsive layouts, also used by the selectors and menus.
- `src/ui/fleet-list.ts`, `src/ui/below-editor-layout.ts`, `src/ui/agent-widget.ts`, and `src/settings.ts`: compact fleet layout, focus ownership, and surface preference/precedence handling.
- `src/ui/agent-mention.ts` and `src/ui/reference-completion.d.ts`: agent completion and reference metadata for the shared file/agent picker and preview integration.
- `src/agent-manager.ts` and `src/agent-counts.ts`: live running/queued count observation and publication for Neo metadata. The manager has local changes; runtime-owning files are not asserted to be byte-for-byte upstream copies.
- `src/ui/workflow-tool-result.ts`, `src/ui/workflow-transcript-updates.ts`, and `src/ui/agent-widget.ts`: structured agent/workflow progress rendering and live transcript updates used with Nexus's Tron presentation adapters.
- `src/index.ts`: wiring for these surfaces, mention completion, count publication, and their session lifecycle.

The execution contracts are intended to remain unchanged by these adaptations: tool schemas and execution semantics, agent start/resume/steer/stop/cancel behavior, scheduling, workflow execution and controls, and worktree isolation remain upstream-derived responsibilities. This behavioral boundary does not imply unchanged implementation files.

## Workspace wiring and activation

The local `package.json` uses the private workspace name `@extensions/subagent-tintin`, adds ESM/source exports and a typecheck script, declares the Pi SDK dependencies using Nexus's existing version range, and adds the `@nexus/tui-kit` workspace dependency. Upstream runtime dependency ranges are preserved alongside this Nexus wiring. The local `tsconfig.json` accommodates shared workspace sources through its `rootDir` and `@nexus/tui-kit/*` path mapping. pnpm manages dependencies in the workspace lockfile.

Nexus registers this package under `subagent-tintin`, enabled by default and visible in `/features`; its minimal-mode allowlist also retains the extension. The Herdr-backed `subagents` registration is removed; its source is retained.
