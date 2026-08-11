import {
	getModelCachePath,
	type ProviderStateCache,
	readProviderStateCache,
} from "../cache/index";
import { DEFAULT_PORTS } from "../constants/default-ports";
import type { ProvidersConfig } from "../config/types";
import type { AiGateway } from "../index";
import { createGateway } from "./createGateway";

/**
 * Builds configured gateway instances from user config, plus any
 * providers that appear in the model cache but have no config entry
 * (fallback to hardcoded default ports).
 *
 * Always registers all known providers (those with a default port)
 * so they appear in Pi's native `--list-models` output.  Providers
 * without a user config entry use the hardcoded default port.
 *
 * @param configuredProviders Provider config map from NexusUserConfig.
 * @returns Array of configured AiGateway instances.
 */
export async function getGateways(
	configuredProviders: ProvidersConfig,
): Promise<AiGateway[]> {
	const gateways: AiGateway[] = [];
	const configuredIds = new Set(Object.keys(configuredProviders));

	// Build gateways from user config.
	for (const [providerId, providerConfig] of Object.entries(
		configuredProviders,
	)) {
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

	// Register every known provider (those with a default port) that
	// has no user config.  This ensures all local providers appear in
	// `--list-models` even when the user has zero providers configured.
	for (const providerId of Object.keys(DEFAULT_PORTS)) {
		if (!configuredIds.has(providerId)) {
			const gateway = createGateway(providerId);
			gateways.push(gateway);
		}
	}

	return gateways;
}
