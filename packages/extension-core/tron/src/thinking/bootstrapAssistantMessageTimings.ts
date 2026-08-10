import type { SessionEntry } from "@nexus/pi-platform/sessionManager.js";
import { formatCompactDuration } from "../duration/formatCompactDuration.js";
import { restoreAssistantMessageTiming } from "./assistantMessageTimingState.ts";

/**
 * Rebuilds assistant footer timing labels from resumed session history.
 *
 * The restored label uses the elapsed time between the latest completed user
 * message and each completed assistant message in that same turn.
 *
 * @param entries Session entries from the active branch.
 */
export function bootstrapAssistantMessageTimings(entries: SessionEntry[]): void {
	let latestUserTimestamp: number | undefined;

	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message as { role?: unknown; timestamp?: unknown };
		if (message.role === "user") {
			latestUserTimestamp = typeof message.timestamp === "number" ? message.timestamp : undefined;
			continue;
		}
		if (message.role !== "assistant") continue;
		if (typeof message.timestamp !== "number") continue;
		if (typeof latestUserTimestamp !== "number") continue;
		restoreAssistantMessageTiming(message.timestamp, formatCompactDuration(message.timestamp - latestUserTimestamp));
	}
}
