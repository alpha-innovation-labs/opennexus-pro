import type { LoginImportModelRegistry } from "./LoginImportRegistry.js";

/**
 * Creates a provider display name resolver from registered OAuth providers.
 *
 * @param modelRegistry Active model registry.
 * @returns Function that resolves display labels for provider ids.
 */
export function createProviderDisplayNameResolver(modelRegistry: LoginImportModelRegistry): (providerId: string) => string {
	const namesByProviderId = new Map(
		modelRegistry.authStorage.getOAuthProviders().map((provider) => [provider.id, provider.name] as const),
	);
	return (providerId: string) => namesByProviderId.get(providerId) ?? providerId;
}
