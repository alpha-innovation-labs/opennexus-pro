import { getOAuthProviders } from "@earendil-works/pi-ai/oauth";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds logout leaves for every stored credential, including API-key providers.
 *
 * @param ctx Extension context.
 * @returns Stored auth provider leaves for logout/removal.
 */
export function createLogoutProviderLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	const oauthNameById = new Map(getOAuthProviders().map((provider) => [provider.id, provider.name] as const));
	return ctx.modelRegistry.authStorage
		.list()
		.map((providerId) => {
			const credential = ctx.modelRegistry.authStorage.get(providerId);
			return {
				kind: "provider" as const,
				label: oauthNameById.get(providerId) ?? providerId,
				description: credential?.type === "api_key" ? "API key" : providerId,
				value: providerId,
			};
		})
		.sort((left, right) => left.label.localeCompare(right.label));
}
