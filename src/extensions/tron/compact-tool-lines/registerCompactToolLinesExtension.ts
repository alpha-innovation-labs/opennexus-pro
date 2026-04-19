import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { bootstrapAssistantActivityGrouping } from "../activity/bootstrapAssistantActivityGrouping.ts";
import { bridgeMessageThinkingToTools } from "../activity/bridgeMessageThinkingToTools.ts";
import { closeToolActivityGroup } from "../activity/closeToolActivityGroup.ts";
import { noteUserMessage } from "../activity/noteUserMessage.ts";
import { registerToolActivity } from "../activity/registerToolActivity.ts";
import { registerToolActivityGroup } from "../activity/registerToolActivityGroup.ts";
import { resetAssistantActivityGrouping } from "../activity/resetAssistantActivityGrouping.ts";
import { resetThinkingToolBridge } from "../activity/resetThinkingToolBridge.ts";
import { logExtensionEvent } from "../../primitives/observability/startup-debug.ts";
import { registerCompactBuiltInTool } from "./registerCompactBuiltInTool.ts";

/**
 * Registers the nexus compact tool-lines extension.
 *
 * @param pi Extension API.
 */
export default function registerCompactToolLinesExtension(pi: ExtensionAPI): void {
	logExtensionEvent("compact-tool-lines", "init");
	pi.on("session_start", (event, ctx) => {
		logExtensionEvent("compact-tool-lines", "session_start", {
			reason: event.reason,
			sessionFile: ctx.sessionManager.getSessionFile() ?? null,
		});
		bootstrapAssistantActivityGrouping(ctx.sessionManager.getBranch());
		resetThinkingToolBridge();
		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry?.type !== "message") continue;
			if ((entry.message as any)?.role !== "assistant") continue;
			bridgeMessageThinkingToTools(entry.message as any);
		}
	});
	pi.on("session_shutdown", () => {
		logExtensionEvent("compact-tool-lines", "session_shutdown");
		resetAssistantActivityGrouping();
		resetThinkingToolBridge();
	});
	pi.on("message_start", (event) => {
		if (event.message.role === "user") noteUserMessage();
	});
	pi.on("tool_execution_start", (event: any) => {
		if (typeof event.toolCallId === "string") registerToolActivity(event.toolCallId);
	});
	pi.on("message_end", (event: any) => {
		if (event.message?.role === "assistant") {
			const toolCallIds = (event.message.content ?? [])
				.filter((content: any) => content?.type === "toolCall" && typeof content.id === "string")
				.map((content: any) => content.id);
			if (toolCallIds.length > 0) {
				bridgeMessageThinkingToTools(event.message);
				registerToolActivityGroup(toolCallIds);
				return;
			}
		}
		closeToolActivityGroup();
	});
	registerCompactBuiltInTool(pi, "read");
	registerCompactBuiltInTool(pi, "bash");
	registerCompactBuiltInTool(pi, "edit");
	registerCompactBuiltInTool(pi, "write");
	registerCompactBuiltInTool(pi, "find");
	registerCompactBuiltInTool(pi, "grep");
	registerCompactBuiltInTool(pi, "ls");
	logExtensionEvent("compact-tool-lines", "tools_registered_for_extension_instance");
}
