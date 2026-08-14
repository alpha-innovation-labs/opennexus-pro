# Audit: herdr-agent-end-log

## Summary

The `herdr-agent-end-log` extension has **zero redundant feature-flag enable checks**.

This extension does not import `@nexus/feature-flags` at all, does not call any feature-flag query functions (`isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, `getRegisteredToolRecords`, `getAllBundledExtensionIds`, etc.), and does not statically import any sibling extension's runtime class or function.

## Imports

| Import | Package | Purpose |
|--------|---------|---------|
| `type { ExtensionAPI }` from `@earendil-works/pi-coding-agent` | `@earendil-works/pi-coding-agent` | Type-only import — erased at compile time. Safe. |
| `getNexusAgentDirPath` from `@nexus/runtime` | `@nexus/runtime` | Utility to resolve the Nexus agent directory for state file storage. Not a feature-flag import. |

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | *(no redundant checks found)* | — | — | — |

## Wiring Plan

No injection points are needed. The extension has no sibling-extension dependencies and no feature-flag gating logic to remove.

## Notes

The extension uses `process.env.HERDR_ENV === "1"` as an **environment-based** guard (not a feature-flag check) to determine whether it operates inside a Herdr-managed pane. This is appropriate and not controlled by the feature-flags system — it ensures the extension's CLI calls (`herdr pane current`, `herdr tab get`, `herdr tab rename`) only run when the Herdr CLI is actually available. This guard is **legitimate** and should remain.
