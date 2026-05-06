import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { runImpeccableCommand, SUBCOMMANDS } from "../live/runImpeccableCommand.js";

/**
 * Registers the impeccable command and keyboard shortcut.
 *
 * @param pi Pi extension API.
 */
export function registerImpeccableCommand(pi: ExtensionAPI): void {
	pi.registerCommand("impeccable", withSlashMenuGroup({
		description: "Frontend design: craft, shape, critique, polish, and live iteration",
		handler: async (args, ctx) => {
			const rawArgs = Array.isArray(args) ? args.join(" ") : String(args ?? "");
			const parts = rawArgs.trim().split(/\s+/).filter(Boolean);
			const subcommand = parts[0] || "";
			const subArgs = parts.slice(1).join(" ");

			if (!subcommand) {
				const commands = SUBCOMMANDS.map((command) => command.name).join(", ");
				if (ctx.hasUI) ctx.ui.notify(`Impeccable commands: ${commands}`, "info");
				return;
			}

			await runImpeccableCommand(subcommand, subArgs, ctx);
		},
	}, "Design"));
}
