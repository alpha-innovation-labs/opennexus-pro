import { appendTranscriptEntry } from "./appendTranscriptEntry.js";
import type { PlaygroundPaneState } from "../types.js";

/**
 * Flushes the currently streamed assistant text into one pane transcript.
 *
 * @param pane Playground pane state.
 * @param fallbackText Text to use when no live text was captured.
 */
export function finalizeAssistantMessage(pane: PlaygroundPaneState, fallbackText = ""): void {
	const text = pane.liveAssistantText.trim() || fallbackText.trim();
	pane.liveAssistantText = "";
	if (!text) return;
	appendTranscriptEntry(pane, { role: "assistant", text });
}
