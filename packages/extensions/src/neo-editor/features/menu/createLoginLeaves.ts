import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createLoginImportLeaves } from "./createLoginImportLeaves.js";
import { createLoginProviderLeaves } from "./createLoginProviderLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds login leaves with import sources and providers visible immediately.
 *
 * @param ctx Extension context.
 * @returns Login leaves grouped as Import and Providers.
 */
export function createLoginLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	const providerLeaves = createLoginProviderLeaves(ctx);
	const providerGroupLabel = `Providers (${providerLeaves.length})`;
	return [
		...createLoginImportLeaves(),
		...providerLeaves.map((leaf) => ({
			...leaf,
			groupLabel: providerGroupLabel,
		})),
	];
}
