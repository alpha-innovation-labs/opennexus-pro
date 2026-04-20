import { join } from "node:path";

/**
 * Resolves the temporary obfuscated entry file path.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {string} Absolute obfuscated entry path.
 */
export function getObfuscatedEntryPath(buildWorkDir) {
  return join(buildWorkDir, "nexus.obfuscated.js");
}
