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
  const registry = ctx.modelRegistry;
  if (!registry || !registry.authStorage) return [];
  const providers = registry.authStorage.getOAuthProviders();
  return providers
    .filter((provider) => mode === "login" || registry.authStorage.get(provider.id)?.type === "oauth")
    .map((provider) => ({
      kind: "provider",
      label: provider.name,
      description: provider.id,
      value: provider.id,
    }));
}
