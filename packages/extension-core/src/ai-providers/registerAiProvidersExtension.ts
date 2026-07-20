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
 * appear in the Nexus /login menu, and registers the LiteLLM proxy
 * provider at localhost:4000 with a hardcoded API key.
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
  // Note: unregisterOAuthProvider no longer exists in @earendil-works/pi-ai/oauth
  // (the module only re-exports types).  The OAuth registry is handled upstream.

  // Register a LiteLLM proxy provider (openai-responses API compat) with
  // automatic model discovery from the proxy.
  if (typeof pi.registerProvider === "function") {
    pi.registerProvider("litellm", {
      name: "LiteLLM",
      baseUrl: "http://localhost:4000",
      apiKey: "sk-1234",
      api: "openai-responses",
      refreshModels: async (context) => {
        const res = await fetch("http://localhost:4000/v1/models", {
          headers: { Authorization: "Bearer sk-1234" },
        });
        if (!res.ok) {
          return [];
        }
        const data = await res.json();
        return (
          (data.data ?? []).map((m: { id: string }) => ({
            id: m.id,
            name: m.id,
            reasoning: false,
            input: ["text"] as const,
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 128_000,
            maxTokens: 8_192,
          }))
        );
      },
    });
  }
}
