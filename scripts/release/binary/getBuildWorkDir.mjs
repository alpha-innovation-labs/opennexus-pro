import { resolve } from "node:path";

/**
 * Resolves the temporary release build workspace.
 *
 * @returns {string} Absolute workspace path.
 */
export function getBuildWorkDir() {
  return resolve(".release", "build");
}
