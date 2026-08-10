import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildFallbackTopicTitle } from "./buildFallbackTopicTitle";
import { buildObservationMessageExcerpt } from "./buildObservationMessageExcerpt";
import { decideTopicTitle } from "./decideTopicTitle";
import type { ObservationState, StoredObservationMessage } from "./types";

/**
 * Applies a new user message to the structured observation state.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param state Observation state.
 * @param userMessage Stored user message.
 * @returns Updated observation state.
 */
export async function applyUserObservation(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	state: ObservationState,
	userMessage: StoredObservationMessage,
): Promise<ObservationState> {
	const messageExcerpt = buildObservationMessageExcerpt(userMessage.text);
	const currentTopic = state.topics.at(-1);
	const decidedTitle = await decideTopicTitle(pi, ctx, currentTopic, userMessage.text);
	const nextTitle = decidedTitle ?? (state.topics.length === 0 ? buildFallbackTopicTitle(userMessage.text) : undefined);
	if (!nextTitle) {
		if (currentTopic) {
			currentTopic.userMessages.push(messageExcerpt);
			currentTopic.userMessageIndexes = [...(currentTopic.userMessageIndexes ?? []), userMessage.index];
		}
		return state;
	}
	if (currentTopic?.title === nextTitle) {
		currentTopic.userMessages.push(messageExcerpt);
		currentTopic.userMessageIndexes = [...(currentTopic.userMessageIndexes ?? []), userMessage.index];
		return state;
	}
	state.topics.push({
		index: state.topics.length + 1,
		title: nextTitle,
		startedAt: userMessage.timestamp,
		sourceMessageIndex: userMessage.index,
		userMessageIndexes: [userMessage.index],
		userMessages: [messageExcerpt],
		assistantBullets: [],
	});
	return state;
}
