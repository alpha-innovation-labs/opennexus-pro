import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { syncCmuxPaneTitle } from "../../cmux/syncCmuxPaneTitle.js";
import type { ObservationState } from "./types.js";

/**
 * Updates the Pi session title from the latest observation topic.
 *
 * @param pi Pi extension API.
 * @param state Observation state.
 */
export async function updateSessionTitleFromObservationState(pi: ExtensionAPI, state: ObservationState): Promise<void> {
	const title = state.topics.at(-1)?.title?.trim();
	if (!title) return;
	pi.setSessionName(title);
	await syncCmuxPaneTitle(title);
}
