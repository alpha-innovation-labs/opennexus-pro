import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types";

/**
 * Builds logout leaves for every stored credential, including API-key providers.
 *
 * @param ctx Extension context.
 * @returns Stored auth provider leaves for logout/removal.
 */
export function createLogoutProviderLeaves(
	ctx: ExtensionContext,
): SlashMenuLeaf[] {
	const registry = ctx.modelRegistry;
	if (!registry) return [];
	const providerIds = registry.getRegisteredProviderIds();
	if (providerIds.length === 0) return [];

	const leaves: SlashMenuLeaf[] = [];
	for (const providerId of providerIds) {
		const status = registry.getProviderAuthStatus(providerId);
		if (!status?.configured) {
			continue;
		}
		const displayName = registry.getProviderDisplayName(providerId);
		leaves.push({
			kind: "provider" as const,
			label: displayName,
			description: providerId,
			value: providerId,
		});
	}
	return leaves.sort((a, b) => a.label.localeCompare(b.label));
}
