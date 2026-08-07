import type { AiGateway } from "../AiGateway.js";
import { DEFAULT_PORTS } from "../constants/default-ports.js";
import type { ProvidersConfig } from "../config/types.js";
import { createGateway } from "./createGateway.js";

/**
 * Builds configured gateway instances from user config.
 *
 * For each provider in config, constructs baseUrl as `http://${host}:${port}`
 * and passes it to the gateway factory. For providers without config, falls
 * back to the hardcoded default port.
 *
 * Only builds gateways for providers that have a registered default port
 * (all providers listed in `default-ports.ts`). Unknown providers in config
 * are silently skipped.
 *
 * @param configuredProviders Provider config map from NexusUserConfig.
 * @returns Array of configured AiGateway instances.
 */
export function getGateways(configuredProviders: ProvidersConfig): AiGateway[] {
  const gateways: AiGateway[] = [];

  // Build gateways from user config first (config takes priority).
  const configuredIds = Object.keys(configuredProviders);
  const seen = new Set<string>();

  for (const providerId of configuredIds) {
    const providerConfig = configuredProviders[providerId];
    const baseUrl = `http://${providerConfig.host}:${providerConfig.port}`;
    const gateway = createGateway(providerId, {
      baseUrl,
      apiKey: providerConfig.api_key,
    });
    gateways.push(gateway);
    seen.add(providerId);
  }

  // Also include all known gateways that have NO config entry, so the
  // hardcoded defaults are used as a fallback for unconfigured providers.
  for (const providerId of Object.keys(DEFAULT_PORTS)) {
    if (!seen.has(providerId)) {
      const gateway = createGateway(providerId);
      gateways.push(gateway);
    }
  }

  return gateways;
}
