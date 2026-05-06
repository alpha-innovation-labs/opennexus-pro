import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadVendorExtension } from "./loadVendorExtension.js";

/**
 * Registers the Nexus-native MCP adapter extension backed by vendored pi-mcp-adapter.
 *
 * @param pi Pi extension API.
 */
export async function registerVendorMcpAdapterExtension(pi: ExtensionAPI): Promise<void> {
  await loadVendorExtension(import("../vendor/mcp-adapter/index.js"), pi);
}
