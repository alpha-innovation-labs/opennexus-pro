# adapters

- Source path: `src/adapters`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/adapters` holds adapter definitions and shared adapter contracts for external channels. This top level is organized entirely by 3 immediate component folders.

## Root entry files

This folder has no root-level files.

## Component map

- [`discord`](./adapters/discord.md) — files: `createDiscordAdapterDefinition.ts`, `index.ts`
- [`shared`](./adapters/shared.md) — files: `listBuiltInAdapters.ts`, `types.ts`
- [`telegram`](./adapters/telegram.md) — files: `createTelegramAdapterDefinition.ts`, `index.ts`; subfolders: `api/`, `config/`, `format/`, `live-status/`, `polling/`, `rpc/`, `runtime/`, `session/`

## Read this first

1. `src/adapters/shared/listBuiltInAdapters.ts`
2. `src/adapters/telegram/index.ts`
3. `src/adapters/discord/createDiscordAdapterDefinition.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/adapters/shared/listBuiltInAdapters.ts` lists the currently bundled adapters: Telegram and Discord.
- `src/adapters/telegram/createTelegramAdapterDefinition.ts` marks Telegram as the active `polling` adapter stage, while `src/adapters/discord/createDiscordAdapterDefinition.ts` marks Discord as `planned`.
