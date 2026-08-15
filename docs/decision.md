# Decisions — Extension Architecture

---

## 1. Remove Redundant Feature-Flag Checks

**Status:** Accepted

**Problem:** Extensions call `isRuntimeExtensionFeatureEnabled()` to check whether themselves or siblings are enabled. The feature-flags system already gates whether the extension's registration function is called. If disabled, the code never runs — internal checks are unreachable dead code.

**Decision:** Remove all `isRuntimeExtensionFeatureEnabled()` calls from extensions. Exception: `feature-management` legitimately queries flag state because it's the UI that displays and edits flags.

**Affected:** `hotkeys` (1 check), `neo-editor` (5 checks), `startup-hero` (3 checks).

---

## 2. Break neo-editor ↔ slash-menu Cycle With Data Return

**Status:** Accepted

**Problem:** Two-way imports create a circular package dependency:

```
neo-editor → @extensions/slash-menu  (imports SlashMenuModal)
slash-menu → @extensions/neo-editor  (imports 4 functions)
```

**Decision:** `slash-menu` returns data instead of calling back. `openSlashMenu()` returns `Promise<SlashMenuResult | null>`. Neo-editor owns the prompt line and handles side effects internally. Slash-menu just presents options and returns what was chosen.

**Why this works:** Only one dependency remains (`neo-editor → slash-menu`), breaking the cycle. No injection needed.

**Affected files:** `slash-menu/src/internal-commands/handleInternalModelCommand.ts`, `slash-menu/src/internal-commands/showStartupResumeModal.ts`, `slash-menu/src/SlashMenuModal.ts`, `neo-editor/src/features/promptline/trigger/createSlashModal.ts`.

---

## 3. Platform Layer Never Imports From Extensions

**Status:** Accepted

**Problem:** `@nexus/pi-platform` imports 4 runtime functions from `@extensions/tron`, creating: `tron → pi-platform → tron`.

**Decision:** `pi-platform` is the base API layer — it should be extension-agnostic. Move the two patch functions (`applyCompactModeImagePatch`, `applyToolGroupCollapsePatch`) from `pi-platform` into `tron`'s registration code. Tron registers its own patches when it loads.

**Action:** Delete both patch files from `pi-platform`. Move their logic into `tron`'s registration entry point.

---

## 4. Extract Shared Styling to tui-kit

**Status:** Accepted

**Problem:** Extensions import styling helpers from each other (`context-usage` imports `RESET`, `getContextColor` from `@extensions/neo-editor`), creating circular dependencies.

**Decision:** Move all extension-specific styling and color functions into `@nexus/tui-kit` (the platform-level UI kit). Extensions import styling from `@nexus/tui-kit`, not from sibling extensions.

**Rule:** If multiple extensions need the same styling, it belongs at the platform level. If only one uses it, keep it in that extension.

**Affected:** `context-usage`, `neo-editor`, and any others importing styling from sibling extensions.

---

## 5. Remove Slash-Menu Barrel Re-Exports of context-usage

**Status:** Accepted

**Problem:** `slash-menu/src/index.ts` re-exports 7 functions from `@extensions/context-usage`. If `context-usage` adds `@extensions/slash-menu` as a dependency, it creates a cycle: `context-usage → slash-menu → context-usage`.

**Decision:** Remove the barrel re-exports from `slash-menu`. Consumers that need context-usage functions import from `@extensions/context-usage` directly. Alternatively, move those 7 functions to a shared package.

---

## 6. Injection Is a Band-Aid, Not Architecture

**Status:** Accepted

**Reasoning:** Injection (passing functions through `registerBundledExtensions()`) breaks circular deps but creates technical debt: optional callback hell, bloated signatures, fragile wiring. Acceptable as a temporary measure but not a long-term solution.

**Preferred approach:** Structural refactors that eliminate cross-extension imports:
- Move shared concerns to the platform layer (tui-kit, pi-platform)
- Change data flow direction (return data, don't call back)
- Remove dead code (redundant feature-flag checks)
- Extract to `shared/` when the cycle can't be broken structurally (see §8) — never alias around it in tsconfig

---

## 7. Shared Code Lives in `packages/extension-core/shared/`

**Status:** Accepted

**Problem:** When a function, type, constant, or module is used by two or more extensions, placing it inside one of those extensions creates circular dependency risk — the other extension must import from it, and if that extension later needs anything back, a cycle forms.

**Decision:** Any code used by one or more packages belongs in `packages/extension-core/shared/`. This is a grouping folder (not a published package) that sits alongside all extensions. Extensions import shared code via `@extensions/shared`.

**Rule:** If two or more extensions import the same thing, extract it to `shared/`. If a single extension is the sole consumer, keep it co-located with that extension. This prevents circular deps by design — `shared/` has no dependencies on sibling extensions.

**Existing examples:** `compact-tool-lines/`, `withSlashMenuGroup.ts`.

---

## 8. No Hardlinks in tsconfig to Work Around Dependency Cycles

**Status:** Accepted

**Problem:** A tempting "fix" for a cross-extension dependency is to add a tsconfig `paths` entry (a hardlink) that points straight into a sibling extension's source. That hides the coupling in tooling instead of resolving it — the import graph still depends on another extension's internals, the alias just makes the dependency invisible to readers and to future refactors, and it can mask a cycle that would otherwise force a real fix.

**Decision:** We do NOT add hardlinks to tsconfig to work around cross-extension dependencies. The `paths` entries for `@extensions/*` exist only for the standard package entry-point mapping. Deep-linking into another extension's `src/` as a cycle-breaker is forbidden.

**Rule:** If breaking a dependency would introduce a circular import, extract the shared code to `packages/extension-core/shared/` (per §7) instead. `shared/` has no dependencies on sibling extensions, so the cycle cannot form. The fix is extraction, not aliasing.

---

## Audit Summary: All 22 Extensions

| Extension | Redundant Checks | Sibling Imports | Cycle Risk | Action |
|-----------|-----------------|-----------------|------------|--------|
| `ai-providers` | 0 | 0 | None | None |
| `auto-update` | 0 | 0 | None | None |
| `cmux` | 0 | 1 (slash-menu) | Moderate | Inject or remove |
| `context-usage` | 0 | 3 (pi-platform, slash-menu, neo-editor) | **High** | Extract styling to tui-kit |
| `exit-message` | 0 | 0 | None | None |
| `fff` | 0 | 0 | None | None |
| `herdr-agent-end-log` | 0 | 0 | None | None |
| `hotkeys` | 1 | 0 | None | Remove check |
| `local-image-reader` | 0 | 0 | None | None |
| `neo-editor` | 5 | 8 (from 6 extensions) | **High** | Remove checks + break cycle |
| `notify` | 0 | 0 | None | None |
| `observations` | 0 | 2 (prompts, slash-menu) | Moderate | Inject or remove |
| `pi-packages` | 0 | 0 | None | None |
| `prompts` | 0 | 1 (slash-menu) | Low | Inject or inline |
| `rtk` | 0 | 0 (imported by tron) | Low | None |
| `runtime` | N/A (central loader) | 3 (hotkeys, slash-menu, tron) | **High** | Move patches to siblings |
| `slash-menu` | 0 | 6 (from 4 extensions) | **High** | Break cycle + remove barrel |
| `startup-hero` | 3 | 1 (feature-flags) | Moderate | Remove checks |
| `subagents` | 0 | 0 | None | None |
| `system-prompt` | 0 | 0 | None | None |
| `tron` | 0 | 4 (from rtk) | Moderate | Inject |
| `web-search` | 0 | 0 | None | None |

**Totals:** 9 extensions have findings across 10 packages. 13 extensions are clean.

---


Using a compilterOption to fix a type error is a hack that is unacceptable:
Example:
││  "compilerOptions": {                                                                       │
││    "paths": {                                                                               │
││      "@earendil-works/pi-ai/models": [                                                      │
││        "../../node_modules/@earendil-works/pi-ai/dist/models.d.ts"                          │
││      ]                                                                                      │
││    }                                                                                        │
││  }
