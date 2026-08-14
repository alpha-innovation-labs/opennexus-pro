# Audit: prompts

## Summary

The `prompts` extension (registered under the feature-flag ID `"system-prompt"` in `bundledFeatureFlags`) has **one finding**: a sibling extension runtime import. No feature-flags API calls (`isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, `getAllBundledExtensionIds`, etc.) are used anywhere in the prompts source tree.

---

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| `src/command/registerSystemPromptCommand.ts:5` | `import { withSlashMenuGroup } from "@extensions/slash-menu"` | `@extensions/slash-menu` | **sibling-import** | Replace with injection via `registerEnabledExtensions()` — pass `withSlashMenuGroup` as a config option or callback. |

### Details

**File:** `src/command/registerSystemPromptCommand.ts`
**Line:** 5
**Import:** `import { withSlashMenuGroup } from "@extensions/slash-menu";`
**Usage:** Called at line 22 inside `registerSystemPromptCommand()` to attach a `menuGroup: "Configuration"` property to the command definition object before passing it to `pi.registerCommand()`.

This is a **non-type, runtime import** from a sibling extension (`slash-menu`). It creates a compile-time cross-extension dependency: if the `slash-menu` extension is disabled or removed, the `prompts` extension will fail to compile (and, if transpiled without tree-shaking, may fail at runtime).

`withSlashMenuGroup` is a simple utility function that attaches a `menuGroup` string property to the command definition object. It is not a feature-flag check — it is purely a metadata-attachment helper.

---

## Wiring Plan

### Injection point in `registerEnabledExtensions()` / extension registration

Currently, `registerEnabledExtensions()` iterates over `ExtensionFeatureFlag[]` entries and calls `flag.register(extensionApi)` for each enabled extension. Each `register` function receives the `ExtensionAPI` — but there is no mechanism for one extension's registration to receive utilities from another.

**Proposed change:** Extend the registration contract to accept an optional `dependencies` object that maps sibling extension names to their exported runtime values.

In `createExtensionRegistrationTask`, before calling `flag.register(pi)`, resolve the dependency map from the full registry:

```typescript
// Pseudocode for createExtensionRegistrationTask
const deps = resolveDependencies(filteredFlags, flag.id);
const extensionApi = createProfiledExtensionApi(pi, flag.id, deps);
```

**For the prompts extension specifically:**

1. In the `system-prompt` feature flag definition (in `registry.ts`), add a `dependencies` field referencing the `slash-menu` extension:

```typescript
"system-prompt": {
    enabled: true,
    features: ["system-prompt-management"],
    category: "core",
    dependencies: ["slash-menu"],  // signals runtime dependency
}
```

2. In `registerPromptsExtension()`, accept the dependency map (e.g., `{ withSlashMenuGroup?: (def, group) => object }`) and use it instead of the static import:

```typescript
// Before (static import in registerSystemPromptCommand.ts):
import { withSlashMenuGroup } from "@extensions/slash-menu";

// After (injected):
const commandDef = withSlashMenuGroup
    ? withSlashMenuGroup(commandDef, "Configuration")
    : commandDef;  // graceful fallback if slash-menu is unavailable
```

3. In `registerBundledExtensions()` (or `registerEnabledExtensions()`), wire the dependency by passing `slash-menu`'s exported `withSlashMenuGroup` into the `prompts` registration call.

### Alternative: No injection needed (safe fallback)

Since `withSlashMenuGroup` is purely cosmetic (attaches a `menuGroup` label for slash-menu display), the simplest fix is to **inline the function** in the prompts extension:

```typescript
// In registerSystemPromptCommand.ts, replace the import with:
function withSlashMenuGroup<T extends object>(
    definition: T,
    menuGroup: string,
): T {
    return Object.assign(definition, { menuGroup });
}
```

This eliminates the cross-extension dependency entirely. The function is trivial (4 lines) and has no internal logic that could diverge between extensions. This is the recommended approach unless `withSlashMenuGroup` is expected to evolve with slash-menu-specific behavior.

---

## Exemptions

- **No feature-flags API usage found:** The prompts extension does not call `isRuntimeExtensionFeatureEnabled()`, `getEnabledExtensionFeatureFlags()`, `getRegisteredToolRecords()`, `getAllBundledExtensionIds()`, or any other function from `@nexus/feature-flags`. No own-enablement checks exist.
- **No `feature-management` exemption needed:** This is not the feature-management extension (which would legitimately read/write flag state).
