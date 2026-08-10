import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { syncCmuxPaneTitle } from "../../../cmux/src/syncCmuxPaneTitle";
import type { ObservationState, ObservationTopic } from "./types";

/**
 * Updates the Pi session title from the latest observation topic.
 * Handles corrupted state where title is an array instead of a string.
 *
 * @param pi Pi extension API.
 * @param state Observation state.
 */
export async function updateSessionTitleFromObservationState(pi: ExtensionAPI, state: ObservationState): Promise<void> {
	const topic = state.topics.at(-1);
	if (!topic) return;
	const rawTitle = topic.title;
	// Handle corrupted state where title is an array instead of a string
	let title: string;
	if (Array.isArray(rawTitle)) {
		title = rawTitle.join(" — ");
	} else if (typeof rawTitle === "string") {
		title = rawTitle.trim();
	} else {
		return;
	}
	if (!title) return;
	pi.setSessionName(title);
	await syncCmuxPaneTitle(title);
}
