import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { clearObservationsStatusWidget } from "./clearObservationsStatusWidget.js";
import { renderObservationsStatusWidget } from "./renderObservationsStatusWidget.js";
import { setSessionStartedAt } from "./setSessionStartedAt.js";

/**
 * Registers the below-editor observations status widget.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsStatusWidget(pi: ExtensionAPI): void {
	logExtensionEvent("observations-status-widget", "init");
	const render = renderObservationsStatusWidget;
	pi.on("session_start", async (_event, ctx) => {
		setSessionStartedAt(Date.now());
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("message_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("message_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("turn_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("session_shutdown", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		clearObservationsStatusWidget(ctx);
	});
}
