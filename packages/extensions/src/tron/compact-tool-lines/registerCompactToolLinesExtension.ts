import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { resetAssistantActivityGrouping } from "../activity/resetAssistantActivityGrouping.ts";
import { resetThinkingToolBridge } from "../activity/resetThinkingToolBridge.ts";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
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
		resetAssistantActivityGrouping();
		resetThinkingToolBridge();
	});
	pi.on("session_shutdown", () => {
		logExtensionEvent("compact-tool-lines", "session_shutdown");
		resetAssistantActivityGrouping();
		resetThinkingToolBridge();
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
