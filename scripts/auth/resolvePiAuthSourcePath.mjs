import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the source Pi auth.json path.
 *
 * @returns {string} Absolute Pi auth.json path.
 */
export function resolvePiAuthSourcePath() {
  return join(homedir(), ".pi", "agent", "auth.json");
}
