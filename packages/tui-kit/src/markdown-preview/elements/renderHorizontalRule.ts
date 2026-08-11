import { HORIZONTAL_RULE_CHAR } from "../constants";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment";
import type { MarkdownPreviewTheme } from "../types";

/** Renders a Ratkit-style full-width horizontal rule. */
export function renderHorizontalRule(
	width: number,
	theme?: MarkdownPreviewTheme,
): string {
	return styleMarkdownPreviewSegment(
		theme,
		"horizontalRule",
		HORIZONTAL_RULE_CHAR.repeat(Math.max(0, width)),
	);
}
