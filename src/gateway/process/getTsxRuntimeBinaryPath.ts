import { dirname, join } from "node:path";
import { getSourceEntrypointPath } from "./getSourceEntrypointPath.js";

/**
 * Resolves the local tsx executable used in source mode.
 *
 * @returns Absolute tsx binary path.
 */
export function getTsxRuntimeBinaryPath(): string {
  return join(dirname(dirname(getSourceEntrypointPath())), "node_modules", ".bin", "tsx");
}
