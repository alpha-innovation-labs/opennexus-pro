import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { setAssistantMessageUpdateHook } from "../../../pi-internals/assistantMessageHook.js";
import { formatCompactDuration } from "../duration/formatCompactDuration.js";
import { finishAssistantMessageTiming, getCurrentAssistantStartedAt, resetAssistantMessageTimings, startAssistantMessageTiming } from "./assistantMessageTimingState.ts";
import { installAssistantThinkingStyle } from "./installAssistantThinkingStyle.ts";

/**
 * Registers the tron assistant-thinking extension.
 *
 * @param pi Extension API.
 */
export default function registerAssistantThinkingStyleExtension(pi: ExtensionAPI): void {
	setAssistantMessageUpdateHook(undefined as any);
	installAssistantThinkingStyle();
	pi.on("session_start", async () => {
		resetAssistantMessageTimings();
	});
	pi.on("message_start", async (event) => {
		if (event.message.role !== "assistant") return;
		startAssistantMessageTiming(Date.now());
	});
	pi.on("message_end", async (event) => {
		if (event.message.role !== "assistant") return;
		const startedAt = getCurrentAssistantStartedAt() ?? Date.now();
		finishAssistantMessageTiming(event.message.timestamp ?? Date.now(), formatCompactDuration(Date.now() - startedAt));
	});
	pi.on("session_shutdown", async () => {
		resetAssistantMessageTimings();
	});
}
