# wterm-e2e/pty

- Source path: `apps/wterm-e2e/src/pty`
- Parent: [`wterm-e2e`](../wterm-e2e.md)

## What this area covers

`apps/wterm-e2e/src/pty` is the `pty` side of the web-terminal demo. It is a leaf folder with 4 files and no nested directories.

## Key files

- `apps/wterm-e2e/src/pty/createPythonPtyBridge.ts`
- `apps/wterm-e2e/src/pty/getPtyBridgeScriptPath.ts`
- `apps/wterm-e2e/src/pty/pty_bridge.py`
- `apps/wterm-e2e/src/pty/types.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `apps/wterm-e2e/src/pty/createPythonPtyBridge.ts`
2. `apps/wterm-e2e/src/pty/pty_bridge.py`
3. `apps/wterm-e2e/src/pty/getPtyBridgeScriptPath.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
- This is the only area with a checked-in Python file (`pty_bridge.py`), so it is the place to inspect when the demo PTY bridge itself is in question.
