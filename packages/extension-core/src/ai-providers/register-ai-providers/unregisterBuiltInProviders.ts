import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { builtInPiOAuthProviderIds } from "./builtInPiOAuthProviderIds.js";

/**
 * Unregisters all providers that Pi registers natively, so that
 * local LLM gateways can take their place in the slash menu.
 *
 * @param pi — Pi extension API.
 */
export function unregisterBuiltInProviders(pi: ExtensionAPI): void {
  if (typeof pi.unregisterProvider === "function") {
    for (const id of builtInPiOAuthProviderIds) {
      pi.unregisterProvider(id);
    }
  }
  // Note: unregisterOAuthProvider no longer exists in
  // @earendil-works/pi-ai/oauth (the module only re-exports types).
  // The OAuth registry is handled upstream.
}
