import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { LiteLLmGateway } from "./gateways/litellm.js";
import { LmStudioGateway } from "./gateways/lm-studio.js";
import { LlamaCppGateway } from "./gateways/llama-cpp.js";
import { OllamaGateway } from "./gateways/ollama.js";
import { VllmGateway } from "./gateways/vllm.js";

const builtInPiOAuthProviderIds = new Set([
  "anthropic",
  "github-copilot",
  "google-gemini-cli",
  "google-antigravity",
  "openai-codex",
]);

/**
 * Unregisters all providers that Pi registers natively, so they do not
 * appear in the Nexus /login menu, and registers all local LLM gateways.
 *
 * New gateways are discovered automatically — just create a file in the
 * gateways folder that extends `AiGateway` and add a new instance to the
 * array below.
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

  // Register all gateways (fire-and-forget, never awaited).
  if (typeof pi.registerProvider === "function") {
    const gateways = [
      new LiteLLmGateway(),
      new LmStudioGateway(),
      new LlamaCppGateway(),
      new OllamaGateway(),
      new VllmGateway(),
    ];
    gateways.forEach((gw) => gw.registerProvider(pi));
  }
}
