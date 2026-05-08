import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds provider leaves for the /login provider submenu.
 *
 * @param ctx Extension context.
 * @returns Provider login leaves with configured providers marked.
 */
export function createLoginProviderLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
	return createOAuthProviderLeaves(ctx, "login")
		.map((leaf) => ({
			...leaf,
			currentValue: ctx.modelRegistry.authStorage.hasAuth(leaf.value) ? "configured" : undefined,
		}))
		.sort((left, right) => {
			const configuredRank = Number(right.currentValue === "configured") - Number(left.currentValue === "configured");
			return configuredRank || left.label.localeCompare(right.label);
		});
}
