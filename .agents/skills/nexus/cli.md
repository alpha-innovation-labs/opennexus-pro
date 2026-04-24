# cli

- Source path: `src/cli`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/cli` holds CLI argument parsing, command routing, and small command-specific helpers. This top level mixes 3 root files with 5 immediate component folders.

## Root entry files

- `src/cli/runCli.ts`
- `src/cli/runCliWithApp.ts`
- `src/cli/createAppArgs.ts`

## Component map

- [`adapter`](./cli/adapter.md) — files: `isAdapterCommand.ts`, `isGatewayRunnerCommand.ts`, `printAdapterUsage.ts`, `runAdapterCommand.ts`
- [`extensions`](./cli/extensions.md) — files: `appendNoExtensionsArg.ts`, `hasNoExtensionsFlag.ts`
- [`sessions`](./cli/sessions.md) — files include `hasSessionsFlag.ts`, `listSessions.ts`, `printSessionsTable.ts`, `formatSessionsTable.ts`, `readSessionDirArg.ts`
- [`system-prompt`](./cli/system-prompt.md) — files: `addBaseSystemPromptArg.ts`, `hasBaseSystemPromptArg.ts`
- [`version`](./cli/version.md) — files: `hasVersionFlag.ts`, `printAppVersion.ts`, `readCliPackageVersion.ts`

## Read this first

1. `src/cli/runCli.ts`
2. `src/cli/runCliWithApp.ts`
3. `src/cli/createAppArgs.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/index.ts` enters through `runCli()`, and `src/cli/runCli.ts` delegates to `runCliWithApp()` with the source-mode app runner.
