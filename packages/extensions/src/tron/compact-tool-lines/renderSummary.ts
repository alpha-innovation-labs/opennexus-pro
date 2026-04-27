import { SingleLineToolCall } from "./SingleLineToolCall.ts";
import { renderEditChangeStats } from "./renderEditChangeStats.ts";
import type { SummaryText } from "./SummaryText.ts";
import { truncateSingleLine } from "./truncateSingleLine.ts";
import { truncateSingleLineFromStart } from "./truncateSingleLineFromStart.ts";

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
	summary: SummaryText,
	theme: any,
	hasAttachedResult: boolean,
): SingleLineToolCall {
	const normalizedSummary = {
		main: truncateSingleLineFromStart(summary.main || "…", 220),
		options: truncateSingleLine(summary.options || "", 80),
		inlineStats: truncateSingleLine(summary.inlineStats || "", 24),
		renderedInlineStats: summary.renderedInlineStats,
		renderedOptions: summary.renderedOptions,
	};
	const themedSummary = ["edit", "write"].includes(toolName)
		? renderEditChangeStats(normalizedSummary, theme)
		: normalizedSummary;

	return new SingleLineToolCall(toolCallId, toolName, themedSummary, theme, hasAttachedResult);
}
