import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { resolveModels } from "../gateway/cache";
import type { AiGateway } from "../index";

/**
 * Registers gateways with Pi.
 *
 * Providers with cached models are registered with their cached model
 * list (instant, no network).  Providers without a cache entry are
 * registered with an empty model list — no network calls, no warnings.
 *
 * The user can run `provider refresh` to populate the cache.
 *
 * @param pi — Pi extension API.
 * @param gateways — Array of configured AiGateway instances.
 */
export async function registerGateways(
  pi: ExtensionAPI,
  gateways: AiGateway[],
): Promise<void> {
  if (typeof pi.registerProvider !== "function") {
    return;
  }

  for (const gw of gateways) {
    // resolveModels reads from cache first; only on cache miss does it
    // fetch from the live server.  All cached providers are registered
    // with their models (instant).  Unreachable servers return [] and
    // are silently skipped — no Pi warning.
    const models = await resolveModels(gw.providerId, gw.baseUrl, gw.apiKey);
    if (models.length > 0) {
      gw.registerProvider(pi, models);
    }
  }
}
