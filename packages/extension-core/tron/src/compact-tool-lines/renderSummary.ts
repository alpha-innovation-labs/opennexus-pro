import type { Theme } from "@earendil-works/pi-coding-agent";
import { renderEditChangeStats } from "./renderEditChangeStats";
import { SingleLineToolCall } from "./SingleLineToolCall";
import type { SummaryText } from "./SummaryText";
import { truncateSingleLine } from "./truncateSingleLine";
import { truncateSingleLineFromStart } from "./truncateSingleLineFromStart";

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
	theme: Theme,
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

	return new SingleLineToolCall(
		toolCallId,
		toolName,
		themedSummary,
		theme,
		hasAttachedResult,
	);
}
