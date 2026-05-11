import { builtInPiOAuthProviderIds } from "./builtInPiOAuthProviderIds.js";
import type { AiProviderDefinition } from "./AiProviderDefinition.js";
import { ohMyPiProviderDefinitions } from "./ohMyPiProviderDefinitions.js";

const realProviderIds = new Set(["cursor"]);

/**
 * Returns oh-my-pi provider definitions that can use generic manual credential login.
 *
 * @returns Provider definitions for the generic manual credential flow.
 */
export function getManualOhMyPiProviderDefinitions(): AiProviderDefinition[] {
  return ohMyPiProviderDefinitions.filter((provider) => {
    return !builtInPiOAuthProviderIds.has(provider.id) && !realProviderIds.has(provider.id);
  });
}
