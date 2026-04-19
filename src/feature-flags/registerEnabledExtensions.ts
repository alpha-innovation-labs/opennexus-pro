import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getEnabledExtensionFeatureFlags } from "./getEnabledExtensionFeatureFlags.js";
import type { ExtensionFeatureFlag } from "./types.js";

/**
 * Registers only the enabled extensions from the feature-flag registry.
 *
 * @param pi Pi extension API.
 * @param flags Full extension registry.
 */
export function registerEnabledExtensions(pi: ExtensionAPI, flags: ExtensionFeatureFlag[]): void {
  for (const flag of getEnabledExtensionFeatureFlags(flags)) {
    flag.register(pi);
  }
}
