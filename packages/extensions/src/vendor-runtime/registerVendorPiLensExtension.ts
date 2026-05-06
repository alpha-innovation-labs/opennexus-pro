import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadVendorExtension } from "./loadVendorExtension.js";
import { registerVendorSkillResources } from "./registerVendorSkillResources.js";

/**
 * Registers the Nexus-native Pi Lens extension backed by vendored pi-lens.
 *
 * @param pi Pi extension API.
 */
export async function registerVendorPiLensExtension(pi: ExtensionAPI): Promise<void> {
  registerVendorSkillResources(pi, "pi-lens");
  await loadVendorExtension(import("../vendor/pi-lens/index.js"), pi);
}
