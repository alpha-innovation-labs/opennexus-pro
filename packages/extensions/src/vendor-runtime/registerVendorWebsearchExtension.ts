import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadVendorExtension } from "./loadVendorExtension.js";
import { registerVendorSkillResources } from "./registerVendorSkillResources.js";

/**
 * Registers the Nexus-native websearch extension backed by vendored pi-web-access.
 *
 * @param pi Pi extension API.
 */
export async function registerVendorWebsearchExtension(pi: ExtensionAPI): Promise<void> {
  registerVendorSkillResources(pi, "websearch");
  await loadVendorExtension(import("../vendor/websearch/index.js"), pi);
}
