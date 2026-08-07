import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AiGateway } from "../index.js";

/**
 * Registers all gateways with Pi so the slash menu discovers them.
 *
 * Each gateway's `getModels()` reads from cache (if available) or
 * fetches from the live server and writes back to the cache.
 *
 * @param pi — Pi extension API.
 * @param gateways — Array of configured AiGateway instances.
 */
export async function registerGateways(
  pi: ExtensionAPI,
  gateways: AiGateway[],
): Promise<void> {
  if (typeof pi.registerProvider === "function") {
    for (const gw of gateways) {
      const models = await gw.getModels();
      gw.registerProvider(pi, models);
    }
  }
}
