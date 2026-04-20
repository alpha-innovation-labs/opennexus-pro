import { rm } from "node:fs/promises";

/**
 * Removes a previous release build directory when present.
 *
 * @param {string} directory Build output directory.
 * @returns {Promise<void>}
 */
export async function cleanBuildDir(directory) {
  await rm(directory, { recursive: true, force: true });
}
