import type { ProvidersConfig } from "../config/types.js";
import { getGateways as _getGateways } from "../gateway/getGateways.js";

/**
 * Builds configured gateway instances from user config (or falls back
 * to hardcoded defaults).
 *
 * For each provider in config, constructs `baseUrl` as
 * `http://${host}:${port}` and passes it to the gateway factory.
 * Providers without config fall back to the hardcoded default port.
 * Only builds gateways for providers that have a registered default
 * port (all providers listed in `default-ports.ts`).  Unknown
 * providers in config are silently skipped.
 *
 * @param configuredProviders — Provider config map from NexusUserConfig.
 * @returns Array of configured AiGateway instances.
 */
export async function buildGateways(configuredProviders: ProvidersConfig) {
  return _getGateways(configuredProviders);
}
