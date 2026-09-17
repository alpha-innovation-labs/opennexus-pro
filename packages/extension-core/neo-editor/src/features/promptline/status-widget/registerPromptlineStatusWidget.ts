import type {
	ExtensionAPI,
	ExtensionContext,
	MessageEndEvent,
	MessageStartEvent,
	SessionStartEvent,
	TurnEndEvent,
} from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import {
	resetTpsTracker,
	resetTurnPauseAccumulator,
	recordTpsDelta,
	endTpsStreaming,
	setPromptlineRefreshRequest,
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
			if (event.message.role === "assistant") {
				resetTpsTracker();
				setPromptlineRefreshRequest(() =>
					render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi)),
				);
			}
			render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
		},
	);
	pi.on(
		"message_end",
		async (event: MessageEndEvent, ctx: ExtensionContext) => {
			if (!ctx.hasUI) return;
			if (event.message.role === "assistant") {
				endTpsStreaming();
				setPromptlineRefreshRequest(null);
			}
			render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
		},
	);
	pi.on("turn_end", async (_event: TurnEndEvent, ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		resetTurnPauseAccumulator();
		render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
	});
	pi.on("message_update", async (event, ctx) => {
		if (!ctx.hasUI) return;
		const delta = event.assistantMessageEvent;
		if (
			delta.type === "text_delta" ||
			delta.type === "thinking_delta" ||
			delta.type === "toolcall_delta"
		) {
			// Providers do not expose per-delta token counts; estimate from text.
			if (delta.delta.length > 0) recordTpsDelta(delta.delta.length / 4);
		}
	});
	pi.on("session_shutdown", async () => {
		setPromptlineRefreshRequest(null);
	});
}
