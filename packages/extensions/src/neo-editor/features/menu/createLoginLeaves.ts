import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createLoginImportMenuLeaf } from "./createLoginImportMenuLeaf.js";
import { createLoginProviderLeaves } from "./createLoginProviderLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds login leaves with imports behind a submenu and providers visible immediately.
 *
 * @param ctx Extension context.
 * @returns Login leaves grouped as Import and Providers.
 */
export function createLoginLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	const providerLeaves = createLoginProviderLeaves(ctx);
	const providerGroupLabel = `Providers (${providerLeaves.length})`;
	return [
		createLoginImportMenuLeaf(),
		...providerLeaves.map((leaf) => ({
			...leaf,
			groupLabel: providerGroupLabel,
		})),
	];
}
