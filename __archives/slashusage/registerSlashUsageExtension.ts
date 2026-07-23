import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { clearUsageSnapshots } from "./store/clearUsageSnapshots.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";
import { primeStartupUsageModal } from "./primeStartupUsageModal.js";
import { registerUsageCommand } from "./registerUsageCommand.js";
import { startUsageHistorySampler } from "./history/startUsageHistorySampler.js";
import { stopUsageHistorySampler } from "./history/stopUsageHistorySampler.js";

/**
 * Registers the inline usage widget extension.
 *
 * @param pi Pi extension API.
 */
export function registerSlashUsageExtension(pi: ExtensionAPI): void {
	registerUsageCommand(pi);
	const refreshUsage = (ctx: ExtensionContext, force = false): void => {
		if (!ctx.hasUI) return;
		void refreshUsageForContext(ctx, force).catch(() => undefined);
	};
	pi.on("session_start", async (event, ctx) => {
		startUsageHistorySampler(ctx.cwd, ctx);
		refreshUsage(ctx, true);
		await primeStartupUsageModal(event.reason, ctx);
	});
	pi.on("turn_end", async (_event, ctx) => {
		refreshUsage(ctx, true);
	});
	pi.on("model_select", async (_event, ctx) => {
		startUsageHistorySampler(ctx.cwd, ctx);
		refreshUsage(ctx, true);
	});
	pi.on("session_shutdown", async (_event, ctx) => {
		stopUsageHistorySampler(ctx.cwd);
		clearUsageSnapshots();
	});
}
