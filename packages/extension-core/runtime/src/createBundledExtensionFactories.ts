import type { ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent";

/**
 * Creates the inline extension factories bundled with this app.
 *
 * @param skipExtensions Optional list of extension IDs to skip.
 * @param disabledFeatures CLI-level feature IDs to disable.
 * @param enabledFeatures CLI-level feature IDs to force-enable.
 * @returns The bundled extension factories.
 */
export async function createBundledExtensionFactories(
  skipExtensions?: string[],
  disabledFeatures?: string[],
  enabledFeatures?: string[],
): Promise<ExtensionFactory[]> {
  const startedAt = performance.now();
  const { default: registerBundledExtensions } = await import("./registerBundledExtensions");
  logStartupProfileEvent("extensions", "importBundledExtensions:done", {
    durationMs: Number((performance.now() - startedAt).toFixed(3)),
  });

  const wrapped = (pi: Parameters<typeof registerBundledExtensions>[0]) =>
    registerBundledExtensions(pi, skipExtensions, disabledFeatures, enabledFeatures);

  return [wrapped];
}
