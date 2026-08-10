/**
 * Set of provider IDs that Pi registers natively via OAuth.
 * These are unregistered by `registerAiProvidersExtension` so local
 * gateways can take their place in the slash menu.
 */
export const builtInPiOAuthProviderIds = new Set([
  "anthropic",
  "github-copilot",
  "google-gemini-cli",
  "google-antigravity",
  "openai-codex",
]);
