import { getHeadingStyleToken, HEADING_ICONS } from "../constants";
import { parseInlineSegments } from "../inline/parseInlineSegments";
import { renderInlineSegments } from "../inline/renderInlineSegments";
import { padMarkdownPreviewLine } from "../padMarkdownPreviewLine";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment";
import type { MarkdownPreviewTheme } from "../types";

/** Renders a Ratkit-style full-width heading bar. */
export function renderHeading(
	level: number,
	text: string,
	width: number,
	theme?: MarkdownPreviewTheme,
): string {
	const clampedLevel = Math.min(6, Math.max(1, Math.floor(level)));
	const icon = HEADING_ICONS[clampedLevel - 1] ?? "# ";
	const indent = " ".repeat(clampedLevel);
	const renderedText = renderInlineSegments(parseInlineSegments(text), theme);
	const line = padMarkdownPreviewLine(`${indent}${icon}${renderedText}`, width);
	return styleMarkdownPreviewSegment(
		theme,
		getHeadingStyleToken(clampedLevel),
		line,
	);
}
