# Scripted production-wiring terminal snapshots

Run from the repository root:

```sh
bun node_modules/vitest/vitest.mjs run test/subagent-tintin-production-wiring.test.ts
```

These are deterministic **scripted terminal renders**, not physical visual inspection. The harness drives a real Pi `TuiMainScreen` with keyboard input and terminal resize, using its actual overlay compositor to capture the visible viewport. It also asserts emitted terminal writes for reference opening and idle count repaint. ANSI styling is removed; box geometry and visible text remain. Only the six-character temporary-directory suffix and 17-character random agent IDs are replaced, with equal-width placeholders; the clock is fixed.

The real `runCliWithApp` routes normal, `--minimal`, `-m`, and CLI feature disablement into `registerBundledExtensions`. Real persisted temporary configuration supplies feature and surface preferences. Registration skips unrelated extension owners through the production `skipExtensions` parameter: this is focused Tintin/Neo/Tron/FFF integration, not full default-app startup coverage. No feature registry, registration map, editor/frame, metadata, fleet, provider wrapper, modal, workflow host/runtime, or Tron adapter is mocked.

External boundaries only:

- Model/session execution: deterministic `runAgent` promises and callbacks, never a paid model or autonomous agent.
- Worker process: deterministic worker protocol events; the real workflow runtime handles those events and termination.
- Native search/selection history: FFF runtime search/track calls return a fixture without initializing a database.
- Extension `exec`: returns a failure without executing any command (including Git/worktrees).

The test host implements Pi's extension/UI interfaces, mounts registered editor/widget factories, applies registered autocomplete wrappers, invokes registered tool callbacks, and displays actual Pi tool execution components. The host is intentionally not a Pi model session.

Snapshots cover cohabiting background agent/workflow activity, foreground queued/live/completed transcript results, agent/file reference previews, conversation/workflow modals, multiline short-terminal resize, fleet hidden, legacy widget explicit, and legacy preference dormant beneath an enabled fleet. Assertions additionally verify metadata/fleet ordering, geometry, tool contracts, duplicate suppression, idle updates, result retrieval, and shutdown of active and settled work.
