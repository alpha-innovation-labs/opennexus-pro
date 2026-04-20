import { resolve } from "node:path";

/**
 * Resolves the native binary bundle output directory.
 *
 * @returns {string} Absolute bundle directory path.
 */
export function getBundleDir() {
  return resolve(".release", "bundle");
}
