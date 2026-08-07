/**
 * Reads the provider state cache file and returns its parsed contents.
 *
 * Returns an empty object `{}` when the file does not exist or is
 * malformed JSON — callers must never see an exception.
 *
 * @param cachePath Absolute path to the cache JSON file.
 * @returns Parsed cache object, or `{}` on failure.
 */
import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Full cache: providerId → array of model objects. */
export type ProviderStateCache = Record<string, Array<Record<string, unknown>>>;

export async function readProviderStateCache(
  cachePath: string,
): Promise<ProviderStateCache> {
  try {
    const raw = await readFile(cachePath, "utf-8");
    const parsed = JSON.parse(raw);
    // Accept entries that are arrays (new model-only format).
    const valid: ProviderStateCache = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        valid[key] = value as Array<Record<string, unknown>>;
      }
      // Entries that are objects (old probe+models format) are stale — treat as cache miss.
    }
    return valid;
  } catch {
    return {};
  }
}

/**
 * Writes the provider state cache to disk, creating the `cache/` directory
 * if it does not already exist.
 *
 * @param cachePath Absolute path to the cache JSON file.
 * @param data      Provider state cache data to persist.
 */
export async function writeProviderStateCache(
  cachePath: string,
  data: ProviderStateCache,
): Promise<void> {
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(data, null, 2), "utf-8");
}
