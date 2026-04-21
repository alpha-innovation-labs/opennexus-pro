import type { SessionEntry } from "../../../pi-internals/sessionManager.js";
import { applyAssistantMessageToolGrouping } from "./applyAssistantMessageToolGrouping.ts";
import { noteUserMessage } from "./noteUserMessage.ts";
import { resetAssistantActivityGrouping } from "./resetAssistantActivityGrouping.ts";

/**
 * Rebuilds cached tool grouping from session history.
 *
 * @param entries Session entries from the active branch.
 */
export function bootstrapAssistantActivityGrouping(entries: SessionEntry[]): void {
	resetAssistantActivityGrouping();

	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message as any;
		if (message.role === "user") {
			noteUserMessage();
			continue;
		}
		if (message.role !== "assistant") continue;
		applyAssistantMessageToolGrouping(message);
	}
}
