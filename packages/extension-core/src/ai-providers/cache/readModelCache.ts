/**
 * Reads the async model cache file and returns its parsed contents.
 *
 * Returns an empty object `{}` when the file does not exist or is
 * malformed JSON — callers must never see an exception.
 *
 * @param cachePath Absolute path to the cache JSON file.
 * @returns Parsed cache object, or `{}` on failure.
 */
import { readFile } from "node:fs/promises";
import type { ProviderConfigInput } from "@earendil-works/pi-coding-agent";

export type ModelCache = Record<string, NonNullable<ProviderConfigInput["models"]>>;

export async function readModelCache(cachePath: string): Promise<ModelCache> {
  try {
    const raw = await readFile(cachePath, "utf-8");
    return JSON.parse(raw) as ModelCache;
  } catch {
    return {};
  }
}
