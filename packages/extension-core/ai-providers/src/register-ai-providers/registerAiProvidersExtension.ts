import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readProviderConfig } from "../config/index";
import { buildGateways } from "./buildGateways";
import { registerGateways } from "./registerGateways";
import { unregisterBuiltInProviders } from "./unregisterBuiltInProviders";

/**
 * Unregisters all providers that Pi registers natively, and registers
 * all local LLM gateways so the slash menu discovers them.
 *
 * `getModels()` reads from cache only (never fetches live).  On cache
 * miss, `resolveModels()` fetches from the live server and writes back
 * — but only during background resolution, never on the critical path.
 *
 * New gateways are discovered automatically — add a port and name to
 * `default-ports.ts` and `PROVIDER_NAMES` in `createGateway.ts`.
 *
 * @param pi — Pi extension API.
 * @returns A promise that resolves when providers are unregistered.
 */
export async function registerAiProvidersExtension(
	pi: ExtensionAPI,
): Promise<void> {
	unregisterBuiltInProviders(pi);

	const providerConfig = readProviderConfig();
	const gateways = await buildGateways(providerConfig);

	await registerGateways(pi, gateways);
}
