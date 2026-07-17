import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Registers Nexus' oh-my-pi-inspired AI provider login entries.
 *
 * @param pi Pi extension API.
 * @returns A promise that resolves when async providers are ready.
 */
export async function registerAiProvidersExtension(_pi: ExtensionAPI): Promise<void> {
  // No manual providers registered — all providers are handled upstream by Pi.
}
