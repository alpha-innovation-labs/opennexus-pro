import { SingleLineToolCall } from "./SingleLineToolCall.ts";
import { truncateSingleLine } from "./truncateSingleLine.ts";
import { truncateSummaryMiddle } from "./truncateSummaryMiddle.ts";

/**
 * Creates a compact tool-call renderer from summary text.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param summary Summary content.
 * @param theme UI theme.
 * @param hasAttachedResult Whether the result continues the box.
 * @returns Tool-call component.
 */
export function renderSummary(
	toolCallId: string,
	toolName: string,
	summary: { main: string; options: string },
	theme: any,
	hasAttachedResult: boolean,
): SingleLineToolCall {
	return new SingleLineToolCall(
		toolCallId,
		toolName,
		{
			main: truncateSummaryMiddle(summary.main || "…", 220),
			options: truncateSingleLine(summary.options || "", 80),
		},
		theme,
		hasAttachedResult,
	);
}
