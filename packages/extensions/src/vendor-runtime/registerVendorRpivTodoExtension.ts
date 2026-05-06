import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadVendorExtension } from "./loadVendorExtension.js";

/**
 * Registers the Nexus-native RPIV todo extension backed by vendored @juicesharp/rpiv-todo.
 *
 * @param pi Pi extension API.
 */
export async function registerVendorRpivTodoExtension(pi: ExtensionAPI): Promise<void> {
  await loadVendorExtension(import("../vendor/rpiv-todo/index.js"), pi);
}
