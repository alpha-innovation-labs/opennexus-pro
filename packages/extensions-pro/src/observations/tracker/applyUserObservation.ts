import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildFallbackTopicTitle } from "./buildFallbackTopicTitle.js";
import { buildObservationMessageExcerpt } from "./buildObservationMessageExcerpt.js";
import { decideTopicTitle } from "./decideTopicTitle.js";
import type { ObservationState, StoredObservationMessage } from "./types.js";

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
	const existingTitles = state.topics.map((topic) => topic.title);
	const decidedTitle = await decideTopicTitle(pi, ctx, existingTitles, userMessage.text);
	const nextTitle = decidedTitle ?? (state.topics.length === 0 ? buildFallbackTopicTitle(userMessage.text) : undefined);
	if (!nextTitle) {
		const currentTopic = state.topics.at(-1);
		if (currentTopic) currentTopic.userMessages.push(messageExcerpt);
		return state;
	}
	if (state.topics.at(-1)?.title === nextTitle) {
		const currentTopic = state.topics.at(-1);
		if (currentTopic) currentTopic.userMessages.push(messageExcerpt);
		return state;
	}
	state.topics.push({
		index: state.topics.length + 1,
		title: nextTitle,
		startedAt: userMessage.timestamp,
		sourceMessageIndex: userMessage.index,
		userMessages: [messageExcerpt],
		assistantBullets: [],
	});
	return state;
}
