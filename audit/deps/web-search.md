# Audit: web-search

## Summary

The `web-search` extension is a clean audit. It contains **zero** redundant feature-flag enablement checks.

The extension:
- Does **not** import or call any function from `@nexus/feature-flags` (no `isRuntimeExtensionFeatureEnabled`, `getEnabledExtensionFeatureFlags`, `getRegisteredToolRecords`, `getAllBundledExtensionIds`, etc.).
- Does **not** import any sibling extension's runtime class or function (no cross-extension imports).
- Does **not** check its own enablement status before executing code.
- Does **not** gate any runtime behavior on feature-flag state.

The `enabled` fields found in `config/WebToolsConfig.ts` and `config/loadWebToolsConfig.ts` are **backend-level** configuration flags (per-subservice toggles: SearXNG, Crawl4AI, Jina), not extension-level feature flags. They control whether individual backends are configured and available, which is distinct from the extension-level feature-flag system that gates extension loading.

## Findings

| File | What it checks/imports | From where | Classification | Suggested fix |
|------|----------------------|------------|----------------|---------------|
| *(none)* | | | | |

**No findings.** The web-search extension has no redundant feature-flag checks.

## Import Audit

All imports in the extension are either:

1. **Internal** (`./`) — functions and types within the same extension (safe).
2. **Framework** (`@earendil-works/pi-ai`, `@earendil-works/pi-coding-agent`) — the Pi runtime (safe).
3. **Type-only** (`import type { ... }`) — erased at compile time (safe).

No imports reference `@nexus/feature-flags` or any sibling extension.

## Wiring Plan

No injection points are needed. The extension is already clean and does not reference the feature-flags system at all.

The `registerBundledExtensions()` function that loads this extension already gates its loading based on the extension's feature flag. No internal changes to `web-search` are required.
