import type {
	ExtensionAPI,
	ExtensionContext,
	MessageEndEvent,
	MessageStartEvent,
	SessionStartEvent,
	ToolCallEvent,
	TurnEndEvent,
} from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import {
	resetTpsTracker,
	resetTurnPauseAccumulator,
} from "./promptlineTpsTracker";
import { renderPromptlineStatusWidget } from "./renderPromptlineStatusWidget";
import { setPromptlineSessionStartedAt } from "./setPromptlineSessionStartedAt";

/**
 * Registers the promptline metadata widget for source and release runtimes.
 *
 * @param pi Pi extension API.
 */
export function registerPromptlineStatusWidget(pi: ExtensionAPI): void {
	logExtensionEvent("promptline-status-widget", "init");
	const render = renderPromptlineStatusWidget;
	pi.on(
		"session_start",
		async (_event: SessionStartEvent, ctx: ExtensionContext) => {
			setPromptlineSessionStartedAt(Date.now());
			resetTpsTracker();
			if (!ctx.hasUI) return;
			render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
		},
	);
	pi.on(
		"message_start",
		async (event: MessageStartEvent, ctx: ExtensionContext) => {
			if (!ctx.hasUI) return;
			if (event.message.role !== "assistant") {
				resetTurnPauseAccumulator();
			}
			render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
		},
	);
	pi.on(
		"message_end",
		async (_event: MessageEndEvent, ctx: ExtensionContext) => {
			if (!ctx.hasUI) return;
			render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
		},
	);
	pi.on("turn_end", async (_event: TurnEndEvent, ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		resetTurnPauseAccumulator();
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("tool_call", async (_event: ToolCallEvent, ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
	});
}
