import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { setAssistantMessageUpdateHook } from "@nexus/pi-platform/assistantMessageHook";
import { formatCompactDuration } from "../duration/formatCompactDuration";
import {
	clearActiveAssistantTurnTiming,
	finishAssistantMessageTiming,
	getCurrentAssistantStartedAt,
	getCurrentAssistantTurnStartedAt,
	resetAssistantMessageTimings,
	startAssistantMessageTiming,
	startAssistantTurnTiming,
} from "./assistantMessageTimingState.ts";
import { bootstrapAssistantMessageTimings } from "./bootstrapAssistantMessageTimings.ts";
import { installAssistantThinkingStyle } from "./installAssistantThinkingStyle.ts";

/**
 * Registers the tron assistant-thinking extension.
 *
 * @param pi Extension API.
 */
export default function registerAssistantThinkingStyleExtension(pi: ExtensionAPI): void {
	setAssistantMessageUpdateHook(undefined as any);
	installAssistantThinkingStyle();
	pi.on("session_start", async (_event, ctx) => {
		resetAssistantMessageTimings();
		bootstrapAssistantMessageTimings(ctx.sessionManager.getBranch());
	});
	pi.on("message_start", async (event) => {
		if (event.message.role !== "assistant") return;
		startAssistantMessageTiming(Date.now());
	});
	pi.on("message_end", async (event) => {
		if (event.message.role === "user") {
			startAssistantTurnTiming(event.message.timestamp ?? Date.now());
			return;
		}
		if (event.message.role !== "assistant") return;
		const startedAt = getCurrentAssistantTurnStartedAt() ?? getCurrentAssistantStartedAt() ?? Date.now();
		finishAssistantMessageTiming(event.message.timestamp ?? Date.now(), formatCompactDuration(Date.now() - startedAt));
	});
	pi.on("agent_end", async () => {
		clearActiveAssistantTurnTiming();
	});
	pi.on("session_shutdown", async () => {
		resetAssistantMessageTimings();
	});
}
