import type { PlaygroundTranscriptEntry } from "../types.js";
import { renderAssistantEntry } from "./renderAssistantEntry.js";
import { renderErrorEntry } from "./renderErrorEntry.js";
import { renderToolEntry } from "./renderToolEntry.js";
import { renderUserEntry } from "./renderUserEntry.js";

/**
 * Renders one playground transcript entry with the appropriate Tron-like style.
 *
 * @param entry Transcript entry.
 * @param theme Active Pi theme.
 * @param width Available content width.
 * @returns Rendered entry lines.
 */
export function renderTranscriptEntry(entry: PlaygroundTranscriptEntry, theme: any, width: number): string[] {
	switch (entry.role) {
		case "user":
			return renderUserEntry(entry.text, width);
		case "assistant":
			return renderAssistantEntry(entry.text, width);
		case "tool":
			return renderToolEntry(entry.text, theme, width);
		case "error":
			return renderErrorEntry(entry.text, theme, width);
		default:
			return [theme.fg("dim", entry.text)];
	}
}
