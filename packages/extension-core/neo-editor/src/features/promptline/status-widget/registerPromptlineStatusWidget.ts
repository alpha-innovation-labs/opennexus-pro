import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { renderPromptlineStatusWidget } from "./renderPromptlineStatusWidget";
import { setPromptlineSessionStartedAt } from "./setPromptlineSessionStartedAt";
import { resetTpsTracker, resetTurnPauseAccumulator } from "./promptlineTpsTracker";

/**
 * Registers the promptline metadata widget for source and release runtimes.
 *
 * @param pi Pi extension API.
 */
export function registerPromptlineStatusWidget(pi: ExtensionAPI): void {
	logExtensionEvent("promptline-status-widget", "init");
	const render = renderPromptlineStatusWidget;
	pi.on("session_start", async (_event, ctx) => {
		setPromptlineSessionStartedAt(Date.now());
		resetTpsTracker();
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("message_start", async (event, ctx) => {
		if (!ctx.hasUI) return;
		const msg = (event as { message?: { role?: string } }).message;
		if (msg?.role !== "assistant") {
			resetTurnPauseAccumulator();
		}
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("message_end", async (event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("turn_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		resetTurnPauseAccumulator();
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("model_select", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("tool_call", async (event, ctx) => {
		if (!ctx.hasUI) return;
	});
	pi.on("tool_end", async (event, ctx) => {
		if (!ctx.hasUI) return;
	});
}
