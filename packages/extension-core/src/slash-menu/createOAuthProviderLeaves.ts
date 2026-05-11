import { getOAuthProviders } from "@earendil-works/pi-ai/oauth";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds OAuth provider leaves for login or logout.
 *
 * @param ctx Extension context.
 * @param mode Selector mode.
 * @returns Provider leaves.
 */
export function createOAuthProviderLeaves(ctx: ExtensionContext, mode: "login" | "logout"): SlashMenuLeaf[] {
  return getOAuthProviders()
    .filter((provider) => mode === "login" || ctx.modelRegistry.authStorage.get(provider.id)?.type === "oauth")
    .map((provider) => ({
      kind: "provider",
      label: provider.name,
      description: provider.id,
      value: provider.id,
    }));
}
