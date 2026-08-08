import type { AiGateway } from "../index.js";
import { getModelCachePath, readProviderStateCache, type ProviderStateCache } from "../cache/index.js";
import type { ProvidersConfig } from "../config/types.js";
import { createGateway } from "./createGateway.js";

/**
 * Builds configured gateway instances from user config, plus any
 * providers that appear in the model cache but have no config entry
 * (fallback to hardcoded default ports).
 *
 * @param configuredProviders Provider config map from NexusUserConfig.
 * @returns Array of configured AiGateway instances.
 */
export async function getGateways(configuredProviders: ProvidersConfig): Promise<AiGateway[]> {
  const gateways: AiGateway[] = [];
  const configuredIds = new Set(Object.keys(configuredProviders));

  // Build gateways from user config.
  for (const [providerId, providerConfig] of Object.entries(configuredProviders)) {
    const baseUrl = `http://${providerConfig.host}:${providerConfig.port}`;
    const gateway = createGateway(providerId, {
      baseUrl,
      apiKey: providerConfig.api_key,
    });
    gateways.push(gateway);
  }

  // Add cached providers that have no config entry, using hardcoded
  // default ports as fallback.
  const cachePath = getModelCachePath();
  const cache: ProviderStateCache = await readProviderStateCache(cachePath);
  for (const providerId of Object.keys(cache)) {
    if (!configuredIds.has(providerId)) {
      const gateway = createGateway(providerId);
      gateways.push(gateway);
    }
  }

  return gateways;
}
