import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerPromptsExtension } from "@extensions/prompts";

/**
 * Registers the Nexus system-prompt extension under its renamed extension id.
 *
 * @param pi Pi extension API.
 */
export function registerSystemPromptExtension(pi: ExtensionAPI): void {
	registerPromptsExtension(pi);
}
