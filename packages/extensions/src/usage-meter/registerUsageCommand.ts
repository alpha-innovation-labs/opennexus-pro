import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getUsageTextForModel } from "./model/getUsageTextForModel.js";
import { withSlashMenuGroup } from "../neo-editor/features/menu/withSlashMenuGroup.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";

/**
 * Registers the manual usage refresh command.
 *
 * @param pi Pi extension API.
 */
export function registerUsageCommand(pi: ExtensionAPI): void {
	pi.registerCommand("usage", withSlashMenuGroup({
		description: "Refresh and show the current provider usage",
		handler: async (_args, ctx) => {
			await refreshUsageForContext(ctx, true);
			if (!ctx.hasUI) return;
			ctx.ui.notify(getUsageTextForModel(ctx.model), "info");
		},
	}, "Configuration"));
}
