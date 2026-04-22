import { resolve } from "node:path";

/**
 * Resolves the temporary npm release package directory.
 *
 * @returns {string} Absolute npm package directory.
 */
export function getReleaseNpmPackageDir() {
  return resolve('.release', 'npm-package');
}
