import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { formatObservationTimestamp } from "../tracker/formatObservationTimestamp";
import { readObservationState } from "../tracker/readObservationState";

/**
 * Reads observation topics as modal items and detail sections.
 *
 * @param statePath Observation state path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Modal items and details.
 */
export async function readObservationSections(
	statePath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): Promise<{ items: AutocompleteItem[]; detailsByValue: Map<string, string[]> }> {
	const state = await readObservationState(statePath, conversationId, cwd, sessionFile);
	const items: AutocompleteItem[] = state.topics.map((topic) => ({
		label: topic.title,
		value: String(topic.index),
	}));
	const detailsByValue = new Map(
		state.topics.map((topic) => [
			String(topic.index),
			[
				`${formatObservationTimestamp(topic.startedAt)}: ${topic.title}`,
				"",
				"User messages",
				...(
					topic.userMessages.length > 0
						? topic.userMessages.map((message) => `- ${message}`)
						: ["- No user messages recorded."]
				),
				"",
				"Assistant thinking",
				...(
					topic.assistantBullets.length > 0
						? topic.assistantBullets.map((bullet) => `- ${bullet}`)
						: ["- No assistant observations yet."]
				),
			],
		]),
	);
	return { items, detailsByValue };
}
