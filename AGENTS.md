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

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
