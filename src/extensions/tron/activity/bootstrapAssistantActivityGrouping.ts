import type { SessionEntry } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/core/session-manager.js";
import { closeToolActivityGroup } from "./closeToolActivityGroup.ts";
import { noteUserMessage } from "./noteUserMessage.ts";
import { registerToolActivityGroup } from "./registerToolActivityGroup.ts";
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
		const toolCallIds = (message.content ?? [])
			.filter((content: any) => content?.type === "toolCall" && typeof content.id === "string")
			.map((content: any) => content.id);
		if (toolCallIds.length > 0) {
			registerToolActivityGroup(toolCallIds);
			continue;
		}
		closeToolActivityGroup();
	}
}
