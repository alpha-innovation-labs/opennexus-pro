import { Text } from "@mariozechner/pi-tui";
import { SmartEvalFooterText } from "../../smart-eval/render/SmartEvalFooterText.js";
import { getAgentLabel } from "./agentLabel.ts";

/**
 * Creates the assistant metadata footer text.
 *
 * @param theme Pi UI theme.
 * @param durationLabel Compact duration label.
 * @param assistantTimestamp Assistant message timestamp.
 * @returns Footer text component.
 */
export function createAssistantMetaText(
	theme: { fg: (name: "muted" | "success" | "error", text: string) => string },
	durationLabel: string,
	assistantTimestamp?: number,
): Text {
	const baseText = theme.fg("muted", `${getAgentLabel()} · ${durationLabel}`);
	return new SmartEvalFooterText(baseText, assistantTimestamp, theme);
}
