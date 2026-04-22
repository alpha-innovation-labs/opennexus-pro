import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { clearUsageSnapshots } from "./store/clearUsageSnapshots.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";
import { clearUsageWidget } from "./ui/clearUsageWidget.js";
import { renderUsageWidget } from "./ui/renderUsageWidget.js";
import { registerUsageCommand } from "./registerUsageCommand.js";

/**
 * Registers the inline usage widget extension.
 *
 * @param pi Pi extension API.
 */
export function registerPiSlashUsageExtension(pi: ExtensionAPI): void {
	registerUsageCommand(pi);
	const refreshAndRender = async (ctx: ExtensionContext, force = false) => {
		if (!ctx.hasUI) return;
		renderUsageWidget(ctx);
		await refreshUsageForContext(ctx, force);
		renderUsageWidget(ctx);
	};
	pi.on("session_start", async (_event, ctx) => {
		await refreshAndRender(ctx, true);
	});
	pi.on("turn_end", async (_event, ctx) => {
		await refreshAndRender(ctx, true);
	});
	pi.on("model_select", async (_event, ctx) => {
		await refreshAndRender(ctx, true);
	});
	pi.on("session_shutdown", async (_event, ctx) => {
		if (ctx.hasUI) clearUsageWidget(ctx);
		clearUsageSnapshots();
	});
}
