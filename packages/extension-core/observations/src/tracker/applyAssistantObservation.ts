import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { summarizeAssistantObservations } from "./summarizeAssistantObservations";
import type { ObservationState, StoredObservationMessage } from "./types";

/**
 * Applies one assistant message to the current observation topic.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param state Observation state.
 * @param assistantMessage Stored assistant message.
 * @returns Updated observation state.
 */
export async function applyAssistantObservation(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	state: ObservationState,
	assistantMessage: StoredObservationMessage,
): Promise<ObservationState> {
	const topic = state.topics.at(-1);
	if (!topic) return state;
	const nextBullets = await summarizeAssistantObservations(
		pi,
		ctx,
		topic.title,
		topic.assistantBullets,
		assistantMessage.thinking ?? "",
		assistantMessage.text,
	);
	for (const bullet of nextBullets) {
		if (!topic.assistantBullets.includes(bullet)) topic.assistantBullets.push(bullet);
	}
	return state;
}
