import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds the provider submenu leaf shown in the /login menu.
 *
 * @param ctx Extension context.
 * @returns Provider submenu leaf with the available provider count.
 */
export function createLoginProviderMenuLeaf(ctx: ExtensionContext): SlashMenuLeaf {
	const providerCount = createOAuthProviderLeaves(ctx, "login").length;
	return {
		kind: "provider",
		label: `Providers (${providerCount})`,
		description: `${providerCount} authentication providers available`,
		value: "providers",
		groupLabel: "Providers",
	};
}
