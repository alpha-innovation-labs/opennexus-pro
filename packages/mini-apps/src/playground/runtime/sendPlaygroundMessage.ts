import type { PlaygroundState } from "../types.js";
import { appendTranscriptEntry } from "./appendTranscriptEntry.js";
import { requestPlaygroundRender } from "./requestPlaygroundRender.js";

/**
 * Sends one user message to all playground child Pi panes.
 *
 * @param state Playground runtime state.
 * @param text User-entered message text.
 */
export async function sendPlaygroundMessage(state: PlaygroundState, text: string): Promise<void> {
	const trimmed = text.trim();
	if (!trimmed) return;
	for (const pane of state.panes) {
		if (!pane.client) continue;
		appendTranscriptEntry(pane, { role: "user", text: trimmed });
		pane.status = pane.busy ? "Queued follow-up…" : "Running…";
	}
	requestPlaygroundRender(state);
	await Promise.all(
		state.panes.map(async (pane) => {
			if (!pane.client) return;
			if (pane.busy) {
				await pane.client.followUp(trimmed);
				return;
			}
			await pane.client.prompt(trimmed);
		}),
	);
}
