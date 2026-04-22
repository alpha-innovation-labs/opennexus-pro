# pi-slash-usage

- Source path: `src/pi-slash-usage`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/pi-slash-usage` holds the bundled usage widget extension and its provider-specific fetchers. This top level mixes 4 root files with 6 immediate component folders.

## Root entry files

- `src/pi-slash-usage/index.ts`
- `src/pi-slash-usage/registerPiSlashUsageExtension.ts`
- `src/pi-slash-usage/registerUsageCommand.ts`
- `src/pi-slash-usage/types.ts`

## Component map

- [`model`](./pi-slash-usage/model.md) — files: `formatUsageSlot.ts`, `getUsageGauge.ts`, `getUsageIconColor.ts`, `getUsageTextForModel.ts`, `renderUsageSlot.ts`, `renderUsageTextForModel.ts`, `selectUsagePair.ts`
- [`providers`](./pi-slash-usage/providers.md) — files: `detectProviderFromModel.ts`, `getProviderLabel.ts`, `getUsageFetcher.ts`; subfolders: `anthropic/`, `antigravity/`, `codex/`, `copilot/`, `gemini/`, `kiro/`, `zai/`
- [`runtime`](./pi-slash-usage/runtime.md) — files: `refreshUsageForContext.ts`, `shouldRefreshUsage.ts`
- [`shared`](./pi-slash-usage/shared.md) — files: `clampPercent.ts`, `collectTokens.ts`, `fetchJson.ts`, `formatDuration.ts`, `formatResetTime.ts`, `normalizeUsedPercent.ts`, `readJsonFile.ts`, `readPiAuth.ts`, `windowMatchesModel.ts`
- [`store`](./pi-slash-usage/store.md) — files: `clearUsageSnapshots.ts`, `getUsageSnapshot.ts`, `setUsageSnapshot.ts`, `subscribeUsageSnapshots.ts`, `usageStoreState.ts`
- [`ui`](./pi-slash-usage/ui.md) — files: `clearUsageWidget.ts`, `createUsageWidget.ts`, `renderUsageWidget.ts`, `usageWidgetKey.ts`

## Read this first

1. `src/pi-slash-usage/registerPiSlashUsageExtension.ts`
2. `src/pi-slash-usage/registerUsageCommand.ts`
3. `src/pi-slash-usage/providers/getUsageFetcher.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/pi-slash-usage/registerPiSlashUsageExtension.ts` wires the usage widget to session, turn, model-select, and shutdown events.
