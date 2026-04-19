import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { ObservationState } from "./types.js";

/**
 * Updates the Pi session title from the latest observation topic.
 *
 * @param pi Pi extension API.
 * @param state Observation state.
 */
export function updateSessionTitleFromObservationState(pi: ExtensionAPI, state: ObservationState): void {
	const title = state.topics.at(-1)?.title?.trim();
	if (title) pi.setSessionName(title);
}
