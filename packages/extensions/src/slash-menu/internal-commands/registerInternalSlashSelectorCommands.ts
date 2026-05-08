import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerSlashCommand } from "../registerSlashCommand.js";
import { handleInternalForkCommand } from "./handleInternalForkCommand.js";
import { handleInternalLoginCommand } from "./handleInternalLoginCommand.js";
import { handleInternalLoginImportCommand } from "./handleInternalLoginImportCommand.js";
import { handleInternalLogoutCommand } from "./handleInternalLogoutCommand.js";
import { handleInternalModelCommand } from "./handleInternalModelCommand.js";
import { handleInternalResumeCommand } from "./handleInternalResumeCommand.js";
import { handleInternalScopedModelsCommand } from "./handleInternalScopedModelsCommand.js";

const commands = {
  "nexus-model-select": handleInternalModelCommand,
  "nexus-resume-select": handleInternalResumeCommand,
  "nexus-fork-select": handleInternalForkCommand,
  "nexus-scoped-models-save": handleInternalScopedModelsCommand,
  "nexus-login-select": handleInternalLoginCommand,
  "nexus-login-import": handleInternalLoginImportCommand,
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
