import { Text } from "@earendil-works/pi-tui";
import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import { CompactToolResult } from "./CompactToolResult";
import { getResultText } from "./getResultText";

/**
 * Creates the fallback compact result renderer.
 *
 * @param toolCallId Tool call id.
 * @param result Tool result payload.
 * @param expanded Whether the result is expanded.
 * @param theme UI theme.
 * @returns Compact result component.
 */
export function renderCompactResult(
	toolCallId: string,
	result: AgentToolResult<any> | undefined,
	expanded: boolean,
	theme: { fg(color: string, text: string): string },
): CompactToolResult | Text {
	const text = getResultText(result);
	if (!text) return new Text("", 0, 0);
	return new CompactToolResult(toolCallId, result!, expanded, theme);
}
