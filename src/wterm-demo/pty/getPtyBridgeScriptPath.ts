import { fileURLToPath } from "node:url";

/**
 * Returns the Python bridge script path used by the browser demo.
 */
export function getPtyBridgeScriptPath(): string {
  return fileURLToPath(new URL("./pty_bridge.py", import.meta.url));
}
