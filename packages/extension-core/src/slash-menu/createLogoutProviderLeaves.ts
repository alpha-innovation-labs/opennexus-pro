import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds logout leaves for every stored credential, including API-key providers.
 *
 * @param ctx Extension context.
 * @returns Stored auth provider leaves for logout/removal.
 */
export function createLogoutProviderLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	const registry = ctx.modelRegistry;
	if (!registry || !registry.authStorage) return [];
	const oauthNameById = new Map(
		registry.authStorage.getOAuthProviders().map((provider) => [provider.id, provider.name] as const),
	);
	return registry.authStorage
		.list()
		.map((providerId) => {
			const credential = registry.authStorage.get(providerId);
			return {
				kind: "provider" as const,
				label: oauthNameById.get(providerId) ?? providerId,
				description: credential?.type === "api_key" ? "API key" : providerId,
				value: providerId,
			};
		})
		.sort((left, right) => left.label.localeCompare(right.label));
}
