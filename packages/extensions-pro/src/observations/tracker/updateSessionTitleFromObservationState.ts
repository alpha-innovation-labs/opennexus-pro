import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { updateChatStatusEntryTitleById } from "@nexus/extensions/chat-status/updateChatStatusEntryTitleById.js";
import { syncCmuxPaneTitle } from "../../cmux/syncCmuxPaneTitle.js";
import type { ObservationState } from "./types.js";

/**
 * Updates the Pi session title from the latest observation topic.
 *
 * @param pi Pi extension API.
 * @param state Observation state.
 * @param chatStatusEntryId Active chat-status entry id.
 */
export async function updateSessionTitleFromObservationState(pi: ExtensionAPI, state: ObservationState, chatStatusEntryId?: string): Promise<void> {
	const title = state.topics.at(-1)?.title?.trim();
	if (!title) return;
	pi.setSessionName(title);
	if (chatStatusEntryId) await updateChatStatusEntryTitleById(chatStatusEntryId, title);
	await syncCmuxPaneTitle(title);
}
