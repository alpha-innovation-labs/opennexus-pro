import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getBuildWorkDir } from "../binary/getBuildWorkDir.mjs";

/**
 * Lists native addon files emitted into the release build workspace.
 *
 * @returns {Promise<string[]>} Absolute native addon paths.
 */
export async function listNativeAddonPaths() {
  const buildWorkDir = getBuildWorkDir();
  const entries = await readdir(buildWorkDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".node"))
    .map((entry) => join(buildWorkDir, entry.name))
    .sort();
}
