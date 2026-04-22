import { join } from "node:path";

/**
 * Resolves the temporary bundled entry file path.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {string} Absolute bundled entry path.
 */
export function getBundledEntryPath(buildWorkDir) {
  return join(buildWorkDir, "nexus.bundle");
}
