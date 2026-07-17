import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

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
  if (typeof pi.unregisterProvider !== "function") {
    return;
  }
  for (const id of builtInPiOAuthProviderIds) {
    pi.unregisterProvider(id);
  }
}
