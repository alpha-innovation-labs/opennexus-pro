import { BLOCKQUOTE_MARKER } from "../constants";
import { styleMarkdownPreviewSegment } from "../styleMarkdownPreviewSegment";
import type { MarkdownPreviewTheme } from "../types";
import { renderParagraph } from "./renderParagraph";

/** Renders a nested Ratkit-style blockquote line. */
export function renderBlockquote(
	depth: number,
	content: string,
	theme?: MarkdownPreviewTheme,
): string {
	const actualDepth = Math.max(1, Math.floor(depth));
	const markers = Array.from({ length: actualDepth }, () =>
		styleMarkdownPreviewSegment(theme, "blockquote.marker", BLOCKQUOTE_MARKER),
	).join(" ");
	const text = styleMarkdownPreviewSegment(
		theme,
		"blockquote.text",
		renderParagraph(content, theme),
	);
	return `${markers} ${text}`;
}
