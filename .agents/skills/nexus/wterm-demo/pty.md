# wterm-demo/pty

- Source path: `src/wterm-demo/pty`
- Parent: [`wterm-demo`](../wterm-demo.md)

## What this area covers

`src/wterm-demo/pty` is the `pty` side of the web-terminal demo. It is a leaf folder with 4 files and no nested directories.

## Key files

- `src/wterm-demo/pty/createPythonPtyBridge.ts`
- `src/wterm-demo/pty/getPtyBridgeScriptPath.ts`
- `src/wterm-demo/pty/pty_bridge.py`
- `src/wterm-demo/pty/types.ts`

## Immediate subareas

This folder has no nested directories.

## Read this first

1. `src/wterm-demo/pty/createPythonPtyBridge.ts`
2. `src/wterm-demo/pty/pty_bridge.py`
3. `src/wterm-demo/pty/getPtyBridgeScriptPath.ts`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Because this is a leaf folder, the root files are the whole implementation surface for this layer.
- This is the only area with a checked-in Python file (`pty_bridge.py`), so it is the place to inspect when the demo PTY bridge itself is in question.
