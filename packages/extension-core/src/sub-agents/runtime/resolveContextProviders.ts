import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { composeSubagentContext } from "../context-providers/composeSubagentContext.js";
import type { SubagentContextProvider } from "../context-providers/types.js";

/**
 * Resolves and composes named context providers for one run.
 *
 * @param ctx Extension runtime context.
 * @param providerIds Ordered provider ids.
 * @param availableProviders All available providers.
 * @returns Composed context block.
 */
export async function resolveContextProviders(
  ctx: ExtensionContext,
  providerIds: string[],
  availableProviders: SubagentContextProvider[],
): Promise<string> {
  const selectedProviders = providerIds.length
    ? availableProviders.filter((provider) => providerIds.includes(provider.id))
    : [];
  return composeSubagentContext(ctx, selectedProviders);
}
