# wterm-demo

- Source path: `src/wterm-demo`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/wterm-demo` holds the web terminal demo stack, from PTY bridge to browser UI. This top level mixes 1 root file with 7 immediate component folders.

## Root entry files

- `src/wterm-demo/startWtermDemo.ts`

## Component map

- [`browser`](./wterm-demo/browser.md) — files: `createTerminalApp.ts`, `index.ts`
- [`config`](./wterm-demo/config.md) — files: `getWtermDemoPort.ts`
- [`html`](./wterm-demo/html.md) — files: `createWtermHtmlDocument.ts`
- [`pty`](./wterm-demo/pty.md) — files: `createPythonPtyBridge.ts`, `getPtyBridgeScriptPath.ts`, `pty_bridge.py`, `types.ts`
- [`server`](./wterm-demo/server.md) — files: `buildBrowserBundle.ts`, `createDemoPty.ts`, `createHttpRequestHandler.ts`, `createTerminalSession.ts`, `createTerminalWebSocketServer.ts`, `getBundleOutputDir.ts`, `getDemoCommand.ts`, `getDemoPtyOptions.ts`, `getShellPath.ts`, `loadNodePty.ts`, `readBundleAsset.ts`, `startDemoServer.ts`
- [`socket`](./wterm-demo/socket.md) — files: `createTerminalSocket.ts`
- [`ui`](./wterm-demo/ui.md) — files: `renderDisconnectedNotice.ts`

## Read this first

1. `src/wterm-demo/startWtermDemo.ts`
2. `src/wterm-demo/server/startDemoServer.ts`
3. `src/wterm-demo/browser/createTerminalApp.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/wterm-demo/startWtermDemo.ts` is the outer demo entrypoint that ties the server-side pieces together.
