import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { renderPromptlineStatusWidget } from "./renderPromptlineStatusWidget.js";
import { setPromptlineSessionStartedAt } from "./setPromptlineSessionStartedAt.js";

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
	pi.on("model_select", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
}
