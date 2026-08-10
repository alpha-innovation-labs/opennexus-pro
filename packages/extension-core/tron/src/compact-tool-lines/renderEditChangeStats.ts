import type { SummaryText } from "./SummaryText";

/**
 * Creates colored git-style change stats for one compact edit summary.
 *
 * @param summary Summary text.
 * @param theme UI theme.
 * @returns Summary with rendered inline stats.
 */
export function renderEditChangeStats(
	summary: SummaryText,
	theme: { fg(color: string, value: string): string },
): SummaryText {
	const [added, removed] = (summary.inlineStats ?? "").split(" ");
	if (!added || !removed) return summary;

	return {
		...summary,
		renderedInlineStats: `${theme.fg("syntaxType", added)} ${theme.fg("error", removed)}`,
	};
}
