import type { ExtensionAPI, ProviderConfig } from "@earendil-works/pi-coding-agent";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";
import type { OAuthCredentials } from "@earendil-works/pi-ai";
import { createLiveCursorProviderModelConfig } from "./createLiveCursorProviderModelConfig.js";
import { getCursorModelsSilently } from "./getCursorModelsSilently.js";

type RegisterProvider = ExtensionAPI["registerProvider"];

/**
 * Registers Cursor models discovered from Cursor's live GetUsableModels endpoint.
 *
 * @param registerProvider Original provider registration callback.
 * @param config Current Cursor provider config carrying baseUrl/oauth settings.
 * @param credentials Cursor OAuth credentials with an access token.
 */
export async function registerLiveCursorModels(
	registerProvider: RegisterProvider,
	config: ProviderConfig,
	credentials: OAuthCredentials,
): Promise<void> {
	const discoveredModels = await getCursorModelsSilently(credentials.access);
	logStartupProfileEvent("ai-providers", "cursorLiveModels:discovered", {
		count: discoveredModels.length,
	});
	if (discoveredModels.length === 0) return;

	registerProvider("cursor", {
		...config,
		models: discoveredModels.map(createLiveCursorProviderModelConfig),
	});
}
