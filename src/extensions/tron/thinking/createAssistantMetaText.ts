import { Text } from "@mariozechner/pi-tui";
import { getAgentLabel } from "./agentLabel.ts";

/**
 * Creates the assistant metadata footer text.
 *
 * @param theme Pi UI theme.
 * @param durationLabel Compact duration label.
 * @returns Footer text component.
 */
export function createAssistantMetaText(theme: { fg: (name: string, text: string) => string }, durationLabel: string): Text {
	return new Text(theme.fg("muted", `${getAgentLabel()} · ${durationLabel}`), 1, 0);
}
