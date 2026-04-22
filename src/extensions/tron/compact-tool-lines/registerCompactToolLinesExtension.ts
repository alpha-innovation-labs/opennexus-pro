import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { applyAssistantMessageToolGrouping } from "../activity/applyAssistantMessageToolGrouping.ts";
import { bootstrapAssistantActivityGrouping } from "../activity/bootstrapAssistantActivityGrouping.ts";
import { closeToolActivityGroup } from "../activity/closeToolActivityGroup.ts";
import { noteCollapsedToolExecutionEnd } from "../activity/noteCollapsedToolExecutionEnd.ts";
import { noteCollapsedToolExecutionStart } from "../activity/noteCollapsedToolExecutionStart.ts";
import { noteUserMessage } from "../activity/noteUserMessage.ts";
import { registerToolActivity } from "../activity/registerToolActivity.ts";
import { resetAssistantActivityGrouping } from "../activity/resetAssistantActivityGrouping.ts";
import { resetThinkingToolBridge } from "../activity/resetThinkingToolBridge.ts";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
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
		resetThinkingToolBridge();
		bootstrapAssistantActivityGrouping(ctx.sessionManager.getBranch());
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
		if (typeof event.toolCallId !== "string") return;
		registerToolActivity(event.toolCallId);
		noteCollapsedToolExecutionStart(event.toolCallId, event.toolName, event.args ?? {});
	});
	pi.on("tool_execution_end", (event: any) => {
		if (typeof event.toolCallId === "string") noteCollapsedToolExecutionEnd(event.toolCallId);
	});
	pi.on("message_end", (event: any) => {
		if (event.message?.role !== "assistant") return;
		applyAssistantMessageToolGrouping(event.message);
	});
	pi.on("turn_end", () => {
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
