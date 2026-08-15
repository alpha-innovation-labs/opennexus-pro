import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability";
import { resetAssistantActivityGrouping } from "../activity/resetAssistantActivityGrouping";
import { resetThinkingToolBridge } from "../activity/resetThinkingToolBridge";

/**
 * Registers the nexus compact tool-lines extension.
 *
 * @param pi Extension API.
 */
export default function registerCompactToolLinesExtension(
	pi: ExtensionAPI,
): void {
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
	logExtensionEvent(
		"compact-tool-lines",
		"tools_registered_for_extension_instance",
	);
}
