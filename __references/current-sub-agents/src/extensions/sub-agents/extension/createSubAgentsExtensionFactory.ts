import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";
import { registerSubAgentsExtension } from "./registerSubAgentsExtension.js";

/**
 * Creates the bundled extension factory for subagents.
 *
 * @returns The subagents extension factory.
 */
export function createSubAgentsExtensionFactory(): ExtensionFactory {
	return registerSubAgentsExtension;
}
