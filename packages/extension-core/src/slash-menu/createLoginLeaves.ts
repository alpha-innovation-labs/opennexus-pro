import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createLoginProviderLeaves } from "./createLoginProviderLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds login leaves with providers visible immediately.
 *
 * @param ctx Extension context.
 * @returns Login leaves grouped as Providers.
 */
export function createLoginLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	const providerLeaves = createLoginProviderLeaves(ctx);
	const providerGroupLabel = `Providers (${providerLeaves.length})`;
	return providerLeaves.map((leaf) => ({
		...leaf,
		groupLabel: providerGroupLabel,
	}));
}
