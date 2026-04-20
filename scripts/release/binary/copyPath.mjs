import { cp, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Copies one file or directory into the bundle.
 *
 * @param {string} source Source path.
 * @param {string} destination Destination path.
 * @returns {Promise<void>}
 */
export async function copyPath(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}
