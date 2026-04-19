# AGENTS

## Project summary

- This project is a custom TUI app built on top of Pi, with local extensions bundled into the app so users do not need to install them separately.
- Add deterministic e2e coverage for every new feature using the virtual-terminal test harness; new extension behavior should ship with a matching regression test.
- Extension availability is controlled through the root `feature-flags.json` file and loaded by `src/feature-flags/`, including per-extension feature lists and enabled/disabled state.
- Because this app builds on top of Pi, use Pi docs and Pi source as the primary reference whenever behavior, APIs, or extension hooks are unclear.
- Extensions are loaded through the bundled `src/extensions/index.ts` entrypoint, and only enabled extensions from the feature-flag registry are registered at runtime.
