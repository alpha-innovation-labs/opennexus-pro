import { readJsonFile } from "./readJsonFile";
import type { ObservationArtifactGroup, ObservationListJsonRow } from "./types";

type ObservationStateLike = {
	topics?: unknown[];
	updatedAt?: number;
	messageCount?: number;
	sessionFile?: string | null;
};

/**
 * Builds a machine-readable list row for one observation group.
 *
 * @param group Observation artifact group.
 * @returns JSON-safe observation row.
 */
export async function createObservationListJsonRow(
	group: ObservationArtifactGroup,
): Promise<ObservationListJsonRow> {
	const statePath = group.statePath ?? group.legacyStatePath;
	const state = (await readJsonFile(statePath)) as
		| ObservationStateLike
		| undefined;
	const updatedAt =
		typeof state?.updatedAt === "number" ? state.updatedAt : undefined;
	const sessionFile =
		typeof state?.sessionFile === "string" || state?.sessionFile === null
			? state.sessionFile
			: null;

	return {
		conversationId: group.conversationId,
		sessionId: group.sessionId,
		hasMessages: Boolean(group.messagesPath),
		hasState: Boolean(group.statePath ?? group.legacyStatePath),
		hasMarkdown: Boolean(group.markdownPath),
		messageCount:
			typeof state?.messageCount === "number" ? state.messageCount : 0,
		topicCount: Array.isArray(state?.topics) ? state.topics.length : 0,
		updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
		sessionFile,
		messagesPath: group.messagesPath,
		statePath: group.statePath,
		legacyStatePath: group.legacyStatePath,
		markdownPath: group.markdownPath,
	};
}
