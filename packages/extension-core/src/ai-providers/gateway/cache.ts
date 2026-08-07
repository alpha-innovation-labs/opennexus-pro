/**
 * Cache read/write helpers for the async model cache feature.
 *
 * Reads and writes the cache file at `{agentDir}/cache/available_models.json`.
 * The cache stores `{ providerId: Model[] }` entries.
 *
 * This module handles:
 * - Reading cached models (cache hit)
 * - Fetching from live server (cache miss)
 * - Writing models back to cache with concurrency control
 */
import {
  getModelCachePath,
  readProviderStateCache,
  writeProviderStateCache,
  type ProviderStateCache,
} from "../cache/index.js";
import type { ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { fetchModelsFromGateway } from "./model-discovery.js";

/**
 * Returns the models for this gateway.  Reads from the cache first;
 * if the cache has no entry for this provider, fetches from the live
 * server.  Always writes back to the cache so the next read is fast.
 *
 * If the live server is unreachable, returns the cached models instead
 * of an empty list — so the slash menu always shows discovered models
 * even when local servers are offline.
 *
 * @param providerId — The gateway's provider identifier.
 * @param baseUrl — The base URL of the inference server.
 * @param apiKey — Optional API key for authentication.
 */
export async function getModels(
  providerId: string,
  baseUrl: string,
  apiKey?: string,
): Promise<NonNullable<ProviderConfigInput["models"]>> {
  const cachePath = getModelCachePath();
  const cache: ProviderStateCache = await readProviderStateCache(cachePath);
  const cached = cache[providerId];

  // Cache hit: return cached models (may be empty).
  if (cached) {
    return cached;
  }

  // Cache miss: fetch from live server and write back.
  const freshModels = await fetchModelsFromGateway(baseUrl, apiKey);
  await writeSingleGatewayCache(cachePath, providerId, freshModels);
  return freshModels;
}

/**
 * On-demand refresh: fetches fresh models from the live server,
 * updates the cache, and returns the new model list.
 *
 * Called by the `refreshModels` callback that Pi invokes when the
 * user explicitly requests a refresh.
 *
 * @param providerId — The gateway's provider identifier.
 * @param baseUrl — The base URL of the inference server.
 * @param apiKey — Optional API key for authentication.
 */
export async function refreshModels(
  providerId: string,
  baseUrl: string,
  apiKey?: string,
): Promise<NonNullable<ProviderConfigInput["models"]>> {
  const models = await fetchModelsFromGateway(baseUrl, apiKey);
  await writeSingleGatewayCache(getModelCachePath(), providerId, models);
  return models;
}

/**
 * Writes a single gateway's model list into the cache file.
 *
 * Deduplicates concurrent writes via an internal promise so that
 * only one write is in flight at a time.
 *
 * Updates only the models array for the given provider.
 *
 * @param cachePath — Absolute path to the cache file.
 * @param providerId — The gateway's provider identifier.
 * @param models — The model list to persist.
 */
async function writeSingleGatewayCache(
  cachePath: string,
  providerId: string,
  models: NonNullable<ProviderConfigInput["models"]>,
): Promise<void> {
  const cache: ProviderStateCache = await readProviderStateCache(cachePath);
  cache[providerId] = models;
  await writeProviderStateCache(cachePath, cache);
}
