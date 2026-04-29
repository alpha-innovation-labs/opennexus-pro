import type { ExtensionAPI, ProviderConfig } from "@mariozechner/pi-coding-agent";
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
	if (!credentials) return;
	await registerLiveCursorModels(registerProvider, config, credentials);
}
