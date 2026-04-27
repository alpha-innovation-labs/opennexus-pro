import { builtInPiOAuthProviderIds } from "./builtInPiOAuthProviderIds.js";
import type { AiProviderDefinition } from "./AiProviderDefinition.js";
import { ohMyPiProviderDefinitions } from "./ohMyPiProviderDefinitions.js";

/**
 * Returns oh-my-pi provider definitions that upstream Pi does not already ship.
 *
 * @returns Provider definitions added by Nexus.
 */
export function getAdditionalOhMyPiProviderDefinitions(): AiProviderDefinition[] {
  return ohMyPiProviderDefinitions.filter((provider) => !builtInPiOAuthProviderIds.has(provider.id));
}
