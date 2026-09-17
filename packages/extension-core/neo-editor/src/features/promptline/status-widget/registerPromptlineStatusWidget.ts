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
import { setBelowEditorSlot } from "../../../../../subagent-tintin/src/ui/below-editor-layout";
import { setPromptlineSessionStartedAt } from "./setPromptlineSessionStartedAt";

/**
 * Registers the promptline metadata widget for source and release runtimes.
 *
 * @param pi Pi extension API.
 */
export function registerPromptlineStatusWidget(pi: ExtensionAPI): void {
	logExtensionEvent("promptline-status-widget", "init");
	let agentCountsLabel = "";
	let unsubscribeCounts: (() => void) | undefined;
	let layoutUI: ExtensionContext["ui"] | undefined;
	const render: typeof renderPromptlineStatusWidget = (ctx, thinking, name) =>
		renderPromptlineStatusWidget(ctx, thinking, name, () => agentCountsLabel);
	pi.on(
		"session_start",
		async (_event: SessionStartEvent, ctx: ExtensionContext) => {
			unsubscribeCounts?.();
			unsubscribeCounts = undefined;
			agentCountsLabel = "";
			setPromptlineSessionStartedAt(Date.now());
			resetTpsTracker();
			if (!ctx.hasUI) return;
			layoutUI = ctx.ui;
			const sessionId = ctx.sessionManager.getSessionId();
			// Tintin's optional bus protocol: no dependency on its activation or fleet.
			unsubscribeCounts = pi.events.on("subagents:counts", (data: unknown) => {
				const counts = data as {
					sessionId?: string; running?: unknown; queued?: unknown;
				} | null;
				if (counts?.sessionId !== sessionId) return;
				const { running, queued } = counts;
				if (
					typeof running !== "number" || typeof queued !== "number" ||
					!Number.isSafeInteger(running) || !Number.isSafeInteger(queued) ||
					running < 0 || queued < 0
				) return;
				const label = running || queued ? `${running} running · ${queued} queued` : "";
				if (label === agentCountsLabel) return;
				agentCountsLabel = label;
				render(ctx, pi.getThinkingLevel.bind(pi), pi.getSessionName.bind(pi));
			});
			// A late consumer also gets the snapshot if Tintin started first.
			pi.events.emit("subagents:counts:request", { sessionId });
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
		if (layoutUI) setBelowEditorSlot(layoutUI, "metadata", undefined);
		layoutUI = undefined;
		unsubscribeCounts?.();
		unsubscribeCounts = undefined;
		agentCountsLabel = "";
		setPromptlineRefreshRequest(null);
	});
}
