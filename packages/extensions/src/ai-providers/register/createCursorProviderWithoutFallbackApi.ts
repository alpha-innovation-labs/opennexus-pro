import type { ExtensionAPI, ProviderConfig } from "@mariozechner/pi-coding-agent";
import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { setStoredCursorModelLoader } from "./cursorStoredModelLoader.js";
import { registerLiveCursorModels } from "./registerLiveCursorModels.js";
import { registerStoredCursorModels } from "./registerStoredCursorModels.js";

/**
 * Creates a Cursor provider config without packaged fallback models.
 *
 * @param config Cursor provider config from pi-cursor-provider.
 * @param registerProvider Original provider registration callback.
 * @returns Cursor provider config with empty initial models and live discovery on credential use.
 */
function createCursorProviderConfigWithoutFallback(
	config: ProviderConfig,
	registerProvider: ExtensionAPI["registerProvider"],
): ProviderConfig {
	return {
		...config,
		models: [],
		oauth: config.oauth
			? {
				...config.oauth,
				/**
				 * Resolves Cursor credentials and asynchronously refreshes models from Cursor.
				 *
				 * @param credentials Cursor OAuth credentials.
				 * @returns API key value expected by the local Cursor proxy.
				 */
				getApiKey(credentials: OAuthCredentials): string {
					const apiKey = config.oauth!.getApiKey(credentials);
					void registerLiveCursorModels(registerProvider, config, credentials);
					return apiKey;
				},
			}
			: undefined,
	};
}

/**
 * Creates an ExtensionAPI view that strips the initial Cursor model registration.
 *
 * The bundled Cursor extension registers its packaged fallback list before OAuth
 * discovery can run. Nexus only wants models returned by Cursor's live endpoint,
 * so the first Cursor provider registration keeps OAuth/proxy config but replaces
 * the fallback models with an empty list. Later registrations from login/refresh
 * are allowed through unchanged because those are endpoint-discovered models.
 *
 * @param pi Original Pi extension API.
 * @returns Extension API that suppresses the Cursor fallback model list.
 */
export function createCursorProviderWithoutFallbackApi(pi: ExtensionAPI): ExtensionAPI {
	let cursorProviderRegistrationCount = 0;
	const originalRegisterProvider = pi.registerProvider.bind(pi);

	return new Proxy(pi, {
		/**
		 * Overrides registerProvider while preserving all other ExtensionAPI properties.
		 *
		 * @param target Original extension API target.
		 * @param property Requested property key.
		 * @param receiver Proxy receiver.
		 * @returns Original property, except for registerProvider.
		 */
		get(target, property, receiver) {
			if (property !== "registerProvider") {
				return Reflect.get(target, property, receiver);
			}

			/**
			 * Registers providers while removing the first Cursor model list.
			 *
			 * @param name Provider identifier.
			 * @param config Provider registration config.
			 */
			return function registerProviderWithoutCursorFallback(name: string, config: ProviderConfig): void {
				if (name !== "cursor") {
					originalRegisterProvider(name, config);
					return;
				}

				cursorProviderRegistrationCount += 1;
				if (cursorProviderRegistrationCount === 1) {
					const sanitizedConfig = createCursorProviderConfigWithoutFallback(config, originalRegisterProvider);
					originalRegisterProvider(name, sanitizedConfig);
					setStoredCursorModelLoader(() => registerStoredCursorModels(originalRegisterProvider, sanitizedConfig));
					return;
				}

				originalRegisterProvider(name, config);
			};
		},
	});
}
