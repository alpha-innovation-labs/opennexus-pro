import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { unregisterOAuthProvider } from "@earendil-works/pi-ai/oauth";

const builtInPiOAuthProviderIds = new Set([
  "anthropic",
  "github-copilot",
  "google-gemini-cli",
  "google-antigravity",
  "openai-codex",
]);

/**
 * Unregisters all providers that Pi registers natively, so they do not
 * appear in the Nexus /login menu.  This extension is intentionally a no-op
 * for provider registration; it only strips unwanted upstream entries.
 *
 * @param pi Pi extension API.
 * @returns A promise that resolves when providers are unregistered.
 */
export async function registerAiProvidersExtension(pi: ExtensionAPI): Promise<void> {
  // Remove from the model registry (used by the slash menu for configured providers)
  if (typeof pi.unregisterProvider === "function") {
    for (const id of builtInPiOAuthProviderIds) {
      pi.unregisterProvider(id);
    }
  }
  // Remove from the OAuth registry (used by createOAuthProviderLeaves)
  for (const id of builtInPiOAuthProviderIds) {
    try {
      unregisterOAuthProvider(id);
    } catch {
      // ignore providers that were already removed
    }
  }
}
