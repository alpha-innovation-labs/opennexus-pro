import { readFile } from "node:fs/promises";
import { buildObservationSummary } from "./buildObservationSummary";
import { createEmptyObservationState } from "./createEmptyObservationState";
import { truncateObservationSummary } from "./truncateObservationSummary";
import type { ObservationState } from "./types";

/**
 * Reads the structured observations state.
 *
 * @param statePath Observation state path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Observation state.
 */
export async function readObservationState(
	statePath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): Promise<ObservationState> {
	try {
		const content = await readFile(statePath, "utf8");
		const parsed = JSON.parse(content) as ObservationState;
		const state = {
			conversationId,
			cwd,
			sessionFile,
			updatedAt: parsed.updatedAt ?? Date.now(),
			messageCount:
				typeof parsed.messageCount === "number"
					? parsed.messageCount
					: undefined,
			summary: typeof parsed.summary === "string" ? parsed.summary : "",
			topics: Array.isArray(parsed.topics)
				? parsed.topics.map((topic, index) => ({
						index: typeof topic?.index === "number" ? topic.index : index + 1,
						title:
							typeof topic?.title === "string" ? topic.title : "Untitled topic",
						startedAt:
							typeof topic?.startedAt === "number"
								? topic.startedAt
								: Date.now(),
						sourceMessageIndex:
							typeof topic?.sourceMessageIndex === "number"
								? topic.sourceMessageIndex
								: 0,
						userMessageIndexes: Array.isArray(topic?.userMessageIndexes)
							? topic.userMessageIndexes.filter(
									(item) => typeof item === "number",
								)
							: undefined,
						userMessages: Array.isArray(topic?.userMessages)
							? topic.userMessages.filter((item) => typeof item === "string")
							: [],
						assistantBullets: Array.isArray(topic?.assistantBullets)
							? topic.assistantBullets.filter(
									(item) => typeof item === "string",
								)
							: [],
					}))
				: [],
		};
		state.summary = state.summary
			? truncateObservationSummary(state.summary)
			: buildObservationSummary(state);
		return state;
	} catch {
		return createEmptyObservationState(conversationId, cwd, sessionFile);
	}
}
