import type { PlaygroundPaneState, PlaygroundTranscriptEntry } from "../types.js";

/**
 * Appends one transcript entry to a playground pane conversation.
 *
 * @param pane Playground pane state.
 * @param entry Transcript entry to append.
 */
export function appendTranscriptEntry(pane: PlaygroundPaneState, entry: PlaygroundTranscriptEntry): void {
	pane.transcript.push(entry);
}
