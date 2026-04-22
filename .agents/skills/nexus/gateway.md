# gateway

- Source path: `src/gateway`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/gateway` holds the long-lived adapter gateway process, its state files, and its lifecycle helpers. This top level is organized entirely by 6 immediate component folders.

## Root entry files

This folder has no root-level files.

## Component map

- [`commands`](./gateway/commands.md) — files: `formatGatewayStatus.ts`, `getGatewayStatus.ts`, `restartGateway.ts`, `startGateway.ts`, `stopGateway.ts`
- [`paths`](./gateway/paths.md) — files: `getGatewayHeartbeatPath.ts`, `getGatewayLogPath.ts`, `getGatewayRootPath.ts`, `getGatewayStatePath.ts`
- [`process`](./gateway/process.md) — files: `getGatewayLaunchSpec.ts`, `getSourceEntrypointPath.ts`, `getTsxRuntimeBinaryPath.ts`, `isProcessAlive.ts`, `spawnGatewayProcess.ts`, `types.ts`, `waitForGatewayReady.ts`, `waitForProcessExit.ts`
- [`runner`](./gateway/runner.md) — files: `ensureGatewayRootDir.ts`, `runGatewayDaemon.ts`, `runGatewayServices.ts`, `writeGatewayHeartbeat.ts`
- [`shared`](./gateway/shared.md) — files: `constants.ts`
- [`state`](./gateway/state.md) — files: `clearGatewayState.ts`, `createGatewayState.ts`, `readGatewayHeartbeat.ts`, `readGatewayState.ts`, `types.ts`, `writeGatewayState.ts`

## Read this first

1. `src/gateway/commands/startGateway.ts`
2. `src/gateway/runner/runGatewayDaemon.ts`
3. `src/gateway/process/spawnGatewayProcess.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/gateway/runner/runGatewayDaemon.ts` owns the daemon heartbeat and state-file lifecycle.
- `src/gateway/commands/startGateway.ts` shows the outer control flow: inspect status, ensure the root dir, spawn the process, then wait for readiness.
