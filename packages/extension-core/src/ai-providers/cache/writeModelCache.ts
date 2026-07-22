/**
 * Writes the async model cache to disk, creating the `cache/` directory
 * if it does not already exist.
 *
 * Uses an atomic write pattern: writes to a temporary file beside the
 * target, then renames it into place. This prevents partial/corrupt
 * reads by concurrent consumers.
 *
 * @param cachePath Absolute path to the cache JSON file.
 * @param data      Cache data to persist.
 */
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function writeModelCache(
  cachePath: string,
  data: Record<string, unknown>,
): Promise<void> {
  const tmpPath = `${cachePath}.tmp`;
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpPath, cachePath);
}
