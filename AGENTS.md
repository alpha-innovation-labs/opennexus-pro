# AGENTS

## Project summary

- This project is a custom TUI app built on top of Pi, with local extensions bundled into the app so users do not need to install them separately.
- Add deterministic e2e coverage for every new feature using the virtual-terminal test harness; new extension behavior should ship with a matching regression test.
- Non-e2e tests are not allowed in this project. Adding or preserving non-e2e tests is a CATASTROPHIC FAILURE; replace them with deterministic e2e coverage instead.
- Extension availability is controlled through the root `feature-flags.json` file and loaded by `src/feature-flags/`, including per-extension feature lists and enabled/disabled state.
- Because this app builds on top of Pi, use Pi docs and Pi source as the primary reference whenever behavior, APIs, or extension hooks are unclear.
- Extensions are loaded through the bundled `src/extensions/index.ts` entrypoint, and only enabled extensions from the feature-flag registry are registered at runtime.
- Nexus-branded UX must never surface Pi branding in the shipped app. UI labels, startup text, version/help output, and self-relaunch flows must use the current Nexus CLI/package, not `pi`.
- Any nested CLI process spawned by Nexus features must relaunch the current Nexus executable/entrypoint via the app’s self-launch helpers so source runs and installed npm releases behave the same.
- Daemon mini-apps must be managed through `packages/mini-apps` manifests: expose user-facing lifecycle commands, route internal runner commands through the current Nexus CLI self-launch path, spawn detached workers, persist state/heartbeat/log files, and stop with graceful signal handling. This is the required pattern for every mini-app daemon going forward, including social chat and annotation-style services.
- Startup changelog/update promo content must stay disabled in Nexus unless the user explicitly asks for it to be restored.
- For `background-sessions` bugs, reproduce from the real run folder first: inspect `~/.pi/agent/sessions/.../background-sessions/runs/<runId>/pi.log` and `session/`. If `pi.log` shows a provider/auth error and `session/` has no `.jsonl`, the child never started a session. Keep regression coverage for both cases: pending modal shows no content, and `/bg-launch` creates a real session with transcript content.
- Temporary release workaround: macOS image paste in the Bun-compiled Nexus binary is currently handled from `neo-editor` using the shared JXA/`osascript` clipboard-image runtime helper. Treat that as a stopgap; do not remove or refactor it away unless the native Pi/Bun release path is proven to work again in the installed binary.
- Future cleanup note: `pi-slash-usage` is still consumed as an external package dependency. Plan to bring that functionality into the app repo/bundle later so Nexus is less dependent on that separate package at runtime.
- Reusable UI building blocks live under `src/extensions/shared/`. Before creating new overlay or picker UI, check that folder first — especially `src/extensions/shared/two-pane-select-modal/` for modal reuse.

It is a CATASTROPHIC FAILURE to have a release of this app, expose source code. I repeat: CATASTROPHIC

This project uses Turbo repo.
Any piece of code is either part of an app in ./apps
or part of a package in ./packages

## CRITICAL — Pi tool-execution monkey-patching

Pi's `ToolExecutionComponent` (in `@earendil-works/pi-coding-agent`) injects blank lines between consecutive tool calls via **two upstream injection points**:

1. **Constructor** — `this.addChild(new Spacer(1))` on every tool execution (line 42 of `tool-execution.js`).
2. **render()** — `lines.push("")` before content lines when `getRenderShell() === "self"` (lines 187-189 of `tool-execution.js`).

Nexus patches both on `ToolExecutionComponent.prototype` in `packages/pi-platform/src/applyToolExecutionSpacingPatch.ts`:
- The `addChild` patch drops the first `Spacer`.
- The `render` patch strips the leading `""` from the returned array.

**Pi frequently changes how it renders tool calls.** Every time the upstream `ToolExecutionComponent` changes its `render()` output, the compact Tron view breaks silently — extra blank lines reappear, or the patch strips the wrong content. **Every change to Pi's tool rendering must be verified with the `consecutiveToolCallsNoExtraSpacing` e2e test.** When a new Pi release ships, diff `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js` against the previous version, specifically lines 42 and 187-189. If either injection point changed, update `applyToolExecutionSpacingPatch` accordingly. Do not assume the existing patch covers a new release.

See `docs/tron-tool-execution-spacing.md` for the full technical breakdown.

