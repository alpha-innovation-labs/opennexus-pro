import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerSlashCommand } from "../registerSlashCommand";
import { handleInternalForkCommand } from "./handleInternalForkCommand";
import { handleInternalLogoutCommand } from "./handleInternalLogoutCommand";
import { handleInternalModelCommand } from "./handleInternalModelCommand";
import { handleInternalResumeCommand } from "./handleInternalResumeCommand";
import { handleInternalScopedModelsCommand } from "./handleInternalScopedModelsCommand";

const commands = {
	"nexus-model-select": handleInternalModelCommand,
	"nexus-resume-select": handleInternalResumeCommand,
	"nexus-fork-select": handleInternalForkCommand,
	"nexus-scoped-models-save": handleInternalScopedModelsCommand,
	"nexus-logout-select": handleInternalLogoutCommand,
} as const;

/**
 * Registers hidden selector action commands used by the custom Nexus slash menu.
 *
 * @param pi Extension API.
 */
export function registerInternalSlashSelectorCommands(pi: ExtensionAPI): void {
	for (const [name, handler] of Object.entries(commands)) {
		registerSlashCommand({ name, hidden: true, source: "extension" });
		pi.registerCommand(name, {
			description: "Hidden Nexus selector action.",
			handler: async (args, ctx) => {
				await handler(args, ctx, pi);
			},
		});
	}
}
