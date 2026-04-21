# AGENTS

## Project summary

- This project is a custom TUI app built on top of Pi, with local extensions bundled into the app so users do not need to install them separately.
- Add deterministic e2e coverage for every new feature using the virtual-terminal test harness; new extension behavior should ship with a matching regression test.
- Extension availability is controlled through the root `feature-flags.json` file and loaded by `src/feature-flags/`, including per-extension feature lists and enabled/disabled state.
- Because this app builds on top of Pi, use Pi docs and Pi source as the primary reference whenever behavior, APIs, or extension hooks are unclear.
- Extensions are loaded through the bundled `src/extensions/index.ts` entrypoint, and only enabled extensions from the feature-flag registry are registered at runtime.
- For `background-sessions` bugs, reproduce from the real run folder first: inspect `~/.pi/agent/sessions/.../background-sessions/runs/<runId>/pi.log` and `session/`. If `pi.log` shows a provider/auth error and `session/` has no `.jsonl`, the child never started a session. Keep regression coverage for both cases: pending modal shows no content, and `/bg-launch` creates a real session with transcript content.
- Temporary release workaround: macOS image paste in the Bun-compiled Nexus binary is currently handled by the bundled `clipboard-image-paste` extension using JXA/`osascript`. Treat that as a stopgap; do not remove or refactor it away unless the native Pi/Bun release path is proven to work again in the installed binary.
- Future cleanup note: `pi-slash-usage` is still consumed as an external package dependency. Plan to bring that functionality into the app repo/bundle later so Nexus is less dependent on that separate package at runtime.
- Reusable UI building blocks live under `src/extensions/shared/`. Before creating new overlay or picker UI, check that folder first — especially `src/extensions/shared/two-pane-select-modal/` for modal reuse.
