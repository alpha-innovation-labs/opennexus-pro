/**
 * Writes the async model cache to disk, creating the `cache/` directory
 * if it does not already exist.
 *
 * @param cachePath Absolute path to the cache JSON file.
 * @param data      Cache data to persist.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeModelCache(
  cachePath: string,
  data: Record<string, unknown>,
): Promise<void> {
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(data, null, 2), "utf-8");
}
