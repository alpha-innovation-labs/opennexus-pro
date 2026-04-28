import type { LoginImportModelRegistry } from "./LoginImportRegistry.js";

/**
 * Collects provider ids known to the active model registry.
 *
 * @param modelRegistry Active model registry.
 * @returns Set of provider ids registered in Nexus.
 */
export function getRegisteredProviderIds(modelRegistry: LoginImportModelRegistry): Set<string> {
	const providerIds = new Set(modelRegistry.getAll().map((model) => model.provider));
	for (const provider of modelRegistry.authStorage.getOAuthProviders()) {
		providerIds.add(provider.id);
	}
	return providerIds;
}
