# adapters/telegram

- Source path: `src/adapters/telegram`
- Parent: [`adapters`](../adapters.md)

## What this area covers

`src/adapters/telegram` is the `telegram` adapter area. At the root it has 2 files plus 8 nested folders.

## Key files

- `src/adapters/telegram/index.ts`
- `src/adapters/telegram/createTelegramAdapterDefinition.ts`

## Immediate subareas

- `src/adapters/telegram/api/`
- `src/adapters/telegram/config/`
- `src/adapters/telegram/format/`
- `src/adapters/telegram/live-status/`
- `src/adapters/telegram/polling/`
- `src/adapters/telegram/rpc/`
- `src/adapters/telegram/runtime/`
- `src/adapters/telegram/session/`

## Read this first

1. `src/adapters/telegram/index.ts`
2. `src/adapters/telegram/createTelegramAdapterDefinition.ts`
3. `src/adapters/telegram/runtime/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
- `src/adapters/telegram/createTelegramAdapterDefinition.ts` currently returns stage `polling`, and `index.ts` re-exports the polling loop from `runtime/`.
