import type { PlaygroundPaneState } from "../types.js";
import { renderTranscriptEntry } from "./renderTranscriptEntry.js";

/**
 * Builds styled transcript lines for one playground pane.
 *
 * @param pane Playground pane state.
 * @param width Available transcript width.
 * @param theme Active Pi theme.
 * @returns Styled transcript lines.
 */
export function getTranscriptLines(pane: PlaygroundPaneState, width: number, theme: any): string[] {
	const rendered = pane.transcript.flatMap((entry, index) => {
		const lines = renderTranscriptEntry(entry, theme, width);
		return index === 0 ? lines : ["", ...lines];
	});
	if (pane.liveAssistantText.trim()) {
		const liveLines = renderTranscriptEntry({ role: "assistant", text: pane.liveAssistantText }, theme, width);
		rendered.push(...(rendered.length > 0 ? [""] : []), ...liveLines);
	}
	return rendered;
}
