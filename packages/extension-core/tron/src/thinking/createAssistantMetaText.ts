import { Text } from "@earendil-works/pi-tui";

/**
 * Creates the assistant metadata footer text.
 *
 * @param theme Pi UI theme.
 * @param durationLabel Compact duration label.
 * @param _assistantTimestamp Unused assistant message timestamp kept for call-site compatibility.
 * @returns Footer text component.
 */
export function createAssistantMetaText(
	theme: { fg: (name: "muted" | "success" | "error", text: string) => string },
	durationLabel: string,
	_assistantTimestamp?: number,
): Text {
	const baseText = theme.fg("muted", `⏱ ${durationLabel}`);
	// paddingY=0 so the footer hugs the box above and the editor/bubble below.
	return new Text(baseText, 1, 0);
}
