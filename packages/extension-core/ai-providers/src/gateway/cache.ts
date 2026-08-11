/**
 * Cache read/write helpers for the async model cache feature.
 *
 * Reads and writes the cache file at `{agentDir}/cache/available_models.json`.
 * The cache stores `{ providerId: Model[] }` entries.
 *
 * This module provides:
 * - `getModels()` — reads cached models only (never fetches live)
 * - `resolveModels()` — reads cache, fetches live on cache miss
 * - `refreshModels()` — always fetches live, updates cache
 * - `writeSingleGatewayCache()` — writes models to cache
 */
import {
	getModelCachePath,
	type ProviderStateCache,
	readProviderStateCache,
	writeProviderStateCache,
} from "../cache/index";
import { fetchModelsFromGateway } from "./model-discovery";

type ProviderConfigInput = {
	models?: Array<Record<string, unknown>>;
};

/**
 * Returns the cached models for this gateway, or an empty array if
 * no cache entry exists.  This function never makes network calls —
 * it is a pure cache read.
 *
 * @param providerId — The gateway's provider identifier.
 */
export async function getModels(
	providerId: string,
): Promise<NonNullable<ProviderConfigInput["models"]>> {
	const cachePath = getModelCachePath();
	const cache: ProviderStateCache = await readProviderStateCache(cachePath);
	const cached = cache[providerId];
	return cached ?? [];
}

/**
 * Resolves models for a gateway: reads from cache, and if the cache
 * is empty, fetches from the live server and writes the result back.
 *
 * If the live server is unreachable, returns an empty array — so the
 * caller can fall back to cached models.
 *
 * @param providerId — The gateway's provider identifier.
 * @param baseUrl — The base URL of the inference server.
 * @param apiKey — Optional API key for authentication.
 */
export async function resolveModels(
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
