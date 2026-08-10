# Feature Management Modal Restructuring

## Problem

The `/features` modal displayed extension groups interleaved (Core/Nexus/Core/Nexus…) instead of grouped by section. The root cause was that bundled extensions were sorted by insertion order, not by their `group` label.

## Changes

### 1. Move minimal flag constant to shared package

- **New file:** `packages/shared/src/minimal.ts`
  - Exports `MINIMAL_FLAGS`, `MINIMAL_EXTENSION_WHITELIST`, `hasMinimalFlag`
- **Updated:** `apps/tui/src/cli/extensions/hasMinimalFlag.ts` — re-exports from `@nexus/shared`
- **Updated:** `packages/extension-core/package.json` — added `@nexus/shared` dependency
- **Updated:** `apps/tui/package.json` — added `@nexus/shared` dependency

This eliminates the cross-package relative import (`packages/extension-core` → `apps/tui`) that caused `ERR_MODULE_NOT_FOUND` at runtime.

### 2. Restructure `getFeatureManagementGroup`

- **File:** `packages/extension-core/src/feature-management/model/getFeatureManagementGroup.ts`
- **Old behavior:** Mini-apps → "Mini apps"; everything else → "Extensions"
- **New behavior:**
  - Mini-apps (`tetris`) → "Mini apps"
  - External Pi Packages (scoped `@scope/name`, `npm:`, or `pi-` prefix) → "Pi Packages"
  - Bundled extensions in `MINIMAL_EXTENSION_WHITELIST` → "Core"
  - All other bundled extensions → "Nexus"
- Added optional `minimalWhitelist?: readonly string[]` parameter to avoid cross-package imports
- Scoped npm packages (e.g. `@plannotator/pi-extension`) are now correctly classified as "Pi Packages" (they start with `@`)

### 3. Update `FeatureManagementGroup` type

- **File:** `packages/extension-core/src/feature-management/model/types.ts`
- **Old:** `"Mini apps" | "Extensions" | "Pi Packages"`
- **New:** `"Core" | "Nexus" | "Pi Packages" | "Mini apps"`

### 4. Sort rows by group in `createFeatureStatusRows`

- **File:** `packages/extension-core/src/feature-statusRows.ts` (createFeatureStatusRows)
- Added `GROUP_ORDER` map: Core=0, Nexus=1, "Pi Packages"=2, "Mini apps"=3
- Rows are now sorted by group order, then alphabetically by feature id within each group

### 5. Sort pi-package rows in `showFeaturesModal`

- **File:** `packages/extension-core/src/feature-management/command/showFeaturesModal.ts`
- Final combined list (bundled + pi-packages) is sorted by group name and feature id

### 6. Thread whitelist through update path

- **File:** `packages/extension-core/src/feature-management/model/persistFeatureFlagOverride.ts`
- `updateFeatureStatusRow` now accepts optional `minimalWhitelist` parameter
- `showFeaturesModal` passes `MINIMAL_EXTENSION_WHITELIST` to `updateFeatureStatusRow`

## Expected Output

```
Core
  ai-providers               › enabled
  exit-message               › enabled
  fff                        › enabled
  neo-editor                 › enabled
  observations               › enabled
  slash-menu                 › enabled
  startup-hero               › enabled
  system-prompt              › enabled
  tron                       › enabled

Nexus
  auto-update                › enabled
  cmux                       › disabled
  context-usage              › enabled
  hotkeys                    › enabled
  local-image-reader         › enabled
  mini-app-manager           › enabled
  notify                     › disabled
  rtk                        › enabled
  subagents                  › enabled
  webtools                   › enabled

Pi Packages
  @plannotator/pi-extension  › enabled
  @vndv/pi-codegraph         › enabled
  pi-packages                › enabled

Mini apps
  tetris                     › enabled
```

## Files Changed

| File | Change |
|------|--------|
| `packages/shared/package.json` | New — exports `*./js` and `*/*` |
| `packages/shared/src/minimal.ts` | New — `MINIMAL_FLAGS`, `MINIMAL_EXTENSION_WHITELIST`, `hasMinimalFlag` |
| `apps/tui/src/cli/extensions/hasMinimalFlag.ts` | Re-export from `@nexus/shared` |
| `packages/extension-core/package.json` | Added `@nexus/shared` dependency |
| `apps/tui/package.json` | Added `@nexus/shared` dependency |
| `packages/extension-core/src/feature-management/model/types.ts` | `FeatureManagementGroup` updated |
| `packages/extension-core/src/feature-management/model/getFeatureManagementGroup.ts` | Rewritten with whitelist parameter |
| `packages/extension-core/src/feature-management/model/createFeatureStatusRows.ts` | Added sort by group |
| `packages/extension-core/src/feature-management/command/showFeaturesModal.ts` | Import from `@nexus/shared`, pass whitelist, sort final list |
| `packages/extension-core/src/feature-management/model/persistFeatureFlagOverride.ts` | `updateFeatureStatusRow` accepts whitelist |
