import { Text } from "@mariozechner/pi-tui";
import { CompactToolResult } from "./CompactToolResult.ts";
import { getResultText } from "./getResultText.ts";

/**
 * Creates the fallback compact result renderer.
 *
 * @param toolCallId Tool call id.
 * @param result Tool result payload.
 * @param expanded Whether the result is expanded.
 * @param theme UI theme.
 * @returns Compact result component.
 */
export function renderCompactResult(toolCallId: string, result: any, expanded: boolean, theme: any): CompactToolResult | Text {
	const text = getResultText(result);
	if (!text) return new Text("", 0, 0);
	return new CompactToolResult(toolCallId, result, expanded, theme);
}
