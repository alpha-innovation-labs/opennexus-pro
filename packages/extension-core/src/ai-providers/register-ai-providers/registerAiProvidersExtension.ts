import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readProviderConfig } from "../config/index.js";
import { unregisterBuiltInProviders } from "./unregisterBuiltInProviders.js";
import { buildGateways } from "./buildGateways.js";
import { registerGateways } from "./registerGateways.js";

/**
 * Unregisters all providers that Pi registers natively, and registers
 * all local LLM gateways so the slash menu discovers them.
 *
 * Each gateway's `getModels()` reads from cache (if available) or
 * fetches from the live server and writes back to the cache.
 *
 * New gateways are discovered automatically — add a port and name to
 * `default-ports.ts` and `PROVIDER_NAMES` in `createGateway.ts`.
 *
 * @param pi — Pi extension API.
 * @returns A promise that resolves when providers are unregistered.
 */
export async function registerAiProvidersExtension(pi: ExtensionAPI): Promise<void> {
  unregisterBuiltInProviders(pi);

  const providerConfig = readProviderConfig();
  const gateways = buildGateways(providerConfig);

  await registerGateways(pi, gateways);
}
