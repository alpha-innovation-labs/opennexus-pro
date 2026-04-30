import type { ExtensionAPI, ProviderConfig } from "@mariozechner/pi-coding-agent";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";
import { readStoredProviderOAuthCredentials } from "./readStoredProviderOAuthCredentials.js";
import { registerLiveCursorModels } from "./registerLiveCursorModels.js";

/**
 * Registers Cursor models for an already-authenticated user at startup.
 *
 * @param registerProvider Original provider registration callback.
 * @param config Cursor provider config carrying OAuth/proxy settings.
 */
export async function registerStoredCursorModels(
	registerProvider: ExtensionAPI["registerProvider"],
	config: ProviderConfig,
): Promise<void> {
	const credentials = await readStoredProviderOAuthCredentials("cursor");
	if (!credentials) {
		logStartupProfileEvent("ai-providers", "cursorStoredModels:noCredentials");
		return;
	}
	logStartupProfileEvent("ai-providers", "cursorStoredModels:credentialsFound");
	await registerLiveCursorModels(registerProvider, config, credentials);
}
