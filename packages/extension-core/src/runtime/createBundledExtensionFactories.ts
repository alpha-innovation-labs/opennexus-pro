import type { ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";

/**
 * Creates the inline extension factories bundled with this app.
 *
 * @returns The bundled extension factories.
 */
export async function createBundledExtensionFactories(): Promise<ExtensionFactory[]> {
  const startedAt = performance.now();
  const { default: registerBundledExtensions } = await import("./registerBundledExtensions.js");
  logStartupProfileEvent("extensions", "importBundledExtensions:done", {
    durationMs: Number((performance.now() - startedAt).toFixed(3)),
  });

  return [registerBundledExtensions];
}
