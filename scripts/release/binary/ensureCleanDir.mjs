import { mkdir, rm } from "node:fs/promises";

/**
 * Recreates a directory from scratch.
 *
 * @param {string} directory Directory to clean and recreate.
 * @returns {Promise<void>}
 */
export async function ensureCleanDir(directory) {
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}
