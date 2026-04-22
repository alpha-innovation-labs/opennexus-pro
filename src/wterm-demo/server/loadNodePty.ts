import { createRequire } from "node:module";
import { resolveInstalledDependencyPath } from "../../runtime/package/resolveInstalledDependencyPath.js";

const require = createRequire(import.meta.url);
const NODE_PTY_ENTRY_PATH = resolveInstalledDependencyPath(
  import.meta.url,
  "node-pty/lib/index.js",
  "../../../node_modules/node-pty/lib/index.js",
);

/**
 * Loads node-pty through the compiled CommonJS entrypoint.
 */
export function loadNodePty(): typeof import("node-pty") {
  return require(NODE_PTY_ENTRY_PATH) as typeof import("node-pty");
}
