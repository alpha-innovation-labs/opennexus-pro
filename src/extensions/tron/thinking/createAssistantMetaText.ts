import { Text } from "@mariozechner/pi-tui";
import { AGENT_LABEL } from "./agentLabel.ts";

/**
 * Creates the assistant metadata footer text.
 *
 * @param theme Pi UI theme.
 * @param durationLabel Compact duration label.
 * @returns Footer text component.
 */
export function createAssistantMetaText(theme: { fg: (name: string, text: string) => string }, durationLabel: string): Text {
	return new Text(theme.fg("muted", `${AGENT_LABEL} · ${durationLabel}`), 1, 0);
}
