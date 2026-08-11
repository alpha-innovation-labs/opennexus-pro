import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerInternalSlashSelectorCommands } from "./internal-commands/registerInternalSlashSelectorCommands";

/**
 * Registers the standalone slash-menu extension internals.
 *
 * @param pi Pi extension API.
 */
export function registerSlashMenuExtension(pi: ExtensionAPI): void {
	registerInternalSlashSelectorCommands(pi);
}
