import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createProfiledExtensionApi } from "@nexus/observability/startup-profile/createProfiledExtensionApi.js";
import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";
import { getEnabledExtensionFeatureFlags } from "./getEnabledExtensionFeatureFlags.js";
import type { ExtensionFeatureFlag } from "./types.js";

/**
 * Registers only the enabled extensions from the feature-flag registry.
 *
 * @param pi Pi extension API.
 * @param flags Full extension registry.
 */
export async function registerEnabledExtensions(pi: ExtensionAPI, flags: ExtensionFeatureFlag[]): Promise<void> {
  for (const flag of getEnabledExtensionFeatureFlags(flags)) {
    const startedAt = performance.now();
    logStartupProfileEvent(flag.id, "register:start");
    await flag.register(createProfiledExtensionApi(pi, flag.id));
    logStartupProfileEvent(flag.id, "register:done", {
      durationMs: Number((performance.now() - startedAt).toFixed(3)),
    });
  }
}
