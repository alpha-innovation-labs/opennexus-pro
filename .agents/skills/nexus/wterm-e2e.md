# wterm-e2e

- Source path: `apps/wterm-e2e/src`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`apps/wterm-e2e/src` holds the web terminal e2e stack, from PTY bridge to browser UI. This top level mixes 1 root file with 7 immediate component folders.

## Root entry files

- `apps/wterm-e2e/src/startWtermE2e.ts`

## Component map

- [`browser`](./wterm-e2e/browser.md) — files: `createTerminalApp.ts`, `index.ts`
- [`config`](./wterm-e2e/config.md) — files: `getWtermE2ePort.ts`
- [`html`](./wterm-e2e/html.md) — files: `createWtermHtmlDocument.ts`
- [`pty`](./wterm-e2e/pty.md) — files: `createPythonPtyBridge.ts`, `getPtyBridgeScriptPath.ts`, `pty_bridge.py`, `types.ts`
- [`server`](./wterm-e2e/server.md) — files: `buildBrowserBundle.ts`, `createE2ePty.ts`, `createHttpRequestHandler.ts`, `createTerminalSession.ts`, `createTerminalWebSocketServer.ts`, `getBundleOutputDir.ts`, `getE2eCommand.ts`, `getE2ePtyOptions.ts`, `getShellPath.ts`, `loadNodePty.ts`, `readBundleAsset.ts`, `startE2eServer.ts`
- [`socket`](./wterm-e2e/socket.md) — files: `createTerminalSocket.ts`
- [`ui`](./wterm-e2e/ui.md) — files: `renderDisconnectedNotice.ts`

## Read this first

1. `apps/wterm-e2e/src/startWtermE2e.ts`
2. `apps/wterm-e2e/src/server/startE2eServer.ts`
3. `apps/wterm-e2e/src/browser/createTerminalApp.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `apps/wterm-e2e/src/startWtermE2e.ts` is the outer e2e entrypoint that ties the server-side pieces together.
