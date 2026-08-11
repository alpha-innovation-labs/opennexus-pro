import { Text } from "@earendil-works/pi-tui";
import { getAgentLabel } from "./agentLabel";

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
	const baseText = theme.fg("muted", `${getAgentLabel()} · ${durationLabel}`);
	return new Text(baseText);
}
