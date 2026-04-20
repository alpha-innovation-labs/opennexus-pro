import { chmod } from "node:fs/promises";

/**
 * Ensures one copied runtime file keeps executable permissions.
 *
 * @param {string} path File path to mark executable.
 * @returns {Promise<void>}
 */
export async function setExecutableMode(path) {
  await chmod(path, 0o755);
}
