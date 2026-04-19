import type { ObservationState } from "./types.js";
import { formatObservationTimestamp } from "./formatObservationTimestamp.js";

/**
 * Renders the structured observations state into markdown.
 *
 * @param state Observation state.
 * @returns Rendered markdown.
 */
export function renderObservationsMarkdown(state: ObservationState): string {
	const lines = [`# Observations for ${state.conversationId}`, ""];
	if (state.topics.length === 0) {
		lines.push("No observations yet.");
		lines.push("");
		return lines.join("\n");
	}
	for (const topic of state.topics) {
		lines.push(`- ${formatObservationTimestamp(topic.startedAt)}: ${topic.title}`);
		lines.push("  - User messages");
		if (topic.userMessages.length === 0) {
			lines.push("    - No user messages recorded.");
		} else {
			for (const message of topic.userMessages) {
				lines.push(`    - ${message}`);
			}
		}
		lines.push("  - Assistant thinking");
		if (topic.assistantBullets.length === 0) {
			lines.push("    - No assistant observations yet.");
		} else {
			for (const bullet of topic.assistantBullets) {
				lines.push(`    - ${bullet}`);
			}
		}
		lines.push("");
	}
	return lines.join("\n");
}
