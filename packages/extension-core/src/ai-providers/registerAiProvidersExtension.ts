import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getManualOhMyPiProviderDefinitions } from "./model/manualOhMyPiProviderDefinitions.js";
import { registerOhMyPiProvider } from "./register/registerOhMyPiProvider.js";

/**
 * Registers Nexus' oh-my-pi-inspired AI provider login entries.
 *
 * @param pi Pi extension API.
 * @returns A promise that resolves when async providers are ready.
 */
export async function registerAiProvidersExtension(pi: ExtensionAPI): Promise<void> {
  if (typeof pi.registerProvider !== "function") {
    return;
  }

  for (const definition of getManualOhMyPiProviderDefinitions()) {
    registerOhMyPiProvider(pi, definition);
  }
}
