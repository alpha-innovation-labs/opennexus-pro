import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerInternalSlashSelectorCommands } from "./internal-commands/registerInternalSlashSelectorCommands.js";

/**
 * Registers the standalone slash-menu extension internals.
 *
 * @param pi Pi extension API.
 */
export function registerSlashMenuExtension(pi: ExtensionAPI): void {
  registerInternalSlashSelectorCommands(pi);
}
