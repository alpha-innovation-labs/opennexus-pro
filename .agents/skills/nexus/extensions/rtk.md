# extensions/rtk

- Source path: `src/extensions/rtk`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/rtk` contains the RTK extension that binds the `rtk` CLI into Nexus and provides RTK-backed wrappers for the built-in read/find/ls/grep/bash tool surfaces.

## Key files

- `src/extensions/rtk/registerRtkExtension.ts`
- `src/extensions/rtk/runtime/createRtkRuntime.ts`
- `src/extensions/rtk/runtime/runtimeStore.ts`
- `src/extensions/rtk/tooling/createRtkBuiltInTools.ts`

## Immediate subareas

- `src/extensions/rtk/runtime/`
- `src/extensions/rtk/tooling/`

## Read this first

1. `src/extensions/rtk/registerRtkExtension.ts`
2. `src/extensions/rtk/runtime/getRtkExecutionCwd.ts`
3. `src/extensions/rtk/tooling/createRtkBuiltInTools.ts`
4. `src/extensions/tron/compact-tool-lines/getBuiltInTools.ts`

## Navigation notes

- Start with the registration entrypoint to see how RTK availability is detected and how the runtime store is populated.
- Then inspect the tooling helpers to see how RTK-backed read/find/ls/grep/bash execution falls back to Nexus's base built-ins when RTK is unavailable.
