import { getLinkIcon } from "../constants";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment";
import type { MarkdownInlineSegment, MarkdownPreviewTheme } from "../types";

/** Renders parsed inline markdown segments into a terminal string. */
export function renderInlineSegments(
	segments: MarkdownInlineSegment[],
	theme?: MarkdownPreviewTheme,
): string {
	return segments
		.map((segment) => renderInlineSegment(segment, theme))
		.join("");
}

/** Renders one inline markdown segment. */
function renderInlineSegment(
	segment: MarkdownInlineSegment,
	theme?: MarkdownPreviewTheme,
): string {
	if (segment.kind === "strong")
		return styleMarkdownPreviewSegment(theme, "strong", segment.text);
	if (segment.kind === "emphasis")
		return styleMarkdownPreviewSegment(theme, "emphasis", segment.text);
	if (segment.kind === "strongEmphasis") {
		return styleMarkdownPreviewSegment(
			theme,
			"strong",
			styleMarkdownPreviewSegment(theme, "emphasis", segment.text),
		);
	}
	if (segment.kind === "inlineCode")
		return styleMarkdownPreviewSegment(
			theme,
			"inlineCode",
			` ${segment.text} `,
		);
	if (segment.kind === "strikethrough")
		return styleMarkdownPreviewSegment(theme, "strikethrough", segment.text);
	if (segment.kind === "link")
		return styleMarkdownPreviewSegment(
			theme,
			"link",
			`${getLinkIcon(segment.url ?? "")}${segment.text}`,
		);
	return segment.text;
}
