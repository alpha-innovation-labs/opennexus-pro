import type { OAuthCredentials, OAuthLoginCallbacks, OAuthProviderInterface } from "@mariozechner/pi-ai";
import type { AiProviderDefinition } from "../model/AiProviderDefinition.js";

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

/**
 * Creates a manual credential OAuth provider for an oh-my-pi provider entry.
 *
 * @param definition Provider metadata.
 * @returns Pi OAuth provider implementation without the id field.
 */
export function createManualOAuthProvider(definition: AiProviderDefinition): Omit<OAuthProviderInterface, "id"> {
  return {
    name: definition.name,
    async login(callbacks: OAuthLoginCallbacks): Promise<OAuthCredentials> {
      const access = await callbacks.onPrompt({
        message: `Enter ${definition.credentialLabel} for ${definition.name}:`,
        placeholder: definition.credentialLabel,
      });
      return {
        access,
        refresh: access,
        expires: Date.now() + TEN_YEARS_MS,
        credentialLabel: definition.credentialLabel,
      };
    },
    async refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials> {
      return credentials;
    },
    getApiKey(credentials: OAuthCredentials): string {
      return String(credentials.access ?? "");
    },
  };
}
