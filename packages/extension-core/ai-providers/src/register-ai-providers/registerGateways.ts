import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { resolveModels } from "../gateway/cache";
import type { AiGateway } from "../index";

/**
 * Registers gateways with Pi.
 *
 * Every known gateway is registered so it appears in Pi's native
 * `--list-models` output.  Providers with cached models are registered
 * with their cached model list.  Providers without a cache entry are
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
		const models = await resolveModels(gw.providerId, gw.baseUrl, gw.apiKey);
		gw.registerProvider(pi, models);
	}
}
