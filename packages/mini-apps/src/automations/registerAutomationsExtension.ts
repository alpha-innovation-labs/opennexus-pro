import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAutomationsCommand } from "./extension/registerAutomationsCommand.js";

/**
 * Registers the Automations mini-app extension surface.
 *
 * @param pi Extension API.
 */
export function registerAutomationsExtension(pi: ExtensionAPI): void {
	registerAutomationsCommand(pi);
}

export default registerAutomationsExtension;
