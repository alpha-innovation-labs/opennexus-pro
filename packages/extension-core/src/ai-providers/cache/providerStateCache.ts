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
import type { GatewayProbeResult } from "../AiGateway.js";

/** Shape of a single provider's cached state. */
export interface CachedProviderState {
  /** The probe result from the last `exists()` call. */
  probe: GatewayProbeResult;
  /** The model list from the last `fetchModels()` call (may be empty). */
  models: Array<Record<string, unknown>>;
}

/** Full cache: providerId → { probe, models }. */
export type ProviderStateCache = Record<string, CachedProviderState>;

export async function readProviderStateCache(
  cachePath: string,
): Promise<ProviderStateCache> {
  try {
    const raw = await readFile(cachePath, "utf-8");
    const parsed = JSON.parse(raw);
    // Filter out entries that don't match the new shape (old model-only format).
    const valid: ProviderStateCache = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const entry = value as Record<string, unknown>;
      if (entry && typeof entry === "object" && "probe" in entry && "models" in entry) {
        valid[key] = entry as CachedProviderState;
      }
      // Entries without probe+models are stale — treat as cache miss.
    }
    return valid;
  } catch {
    return {};
  }
}
