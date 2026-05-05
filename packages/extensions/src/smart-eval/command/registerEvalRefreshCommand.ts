import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { startSmartEvalBackgroundRun } from "../runtime/startSmartEvalBackgroundRun.js";

/**
 * Registers the /eval-refresh command for regenerating all smart-eval results.
 *
 * @param pi Extension API.
 */
export function registerEvalRefreshCommand(pi: ExtensionAPI): void {
	pi.registerCommand("eval-refresh", {
		description: "Refresh smart-eval results for all historical assistant turns",
		handler: async (_args, ctx) => {
			const queued = await startSmartEvalBackgroundRun(ctx, true);
			if (queued === 0) ctx.ui.notify("No historical turns to evaluate.", "info");
		},
	});
}
