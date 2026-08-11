import { styleMarkdownFixedAnsi } from "./styleMarkdownFixedAnsi";
import { styleMarkdownHeadingBackground } from "./styleMarkdownHeadingBackground";
import type { MarkdownPreviewStyleToken, MarkdownPreviewTheme } from "./types";

/** Applies a semantic markdown preview style when a theme is available. */
export function styleMarkdownPreviewSegment(
	theme: MarkdownPreviewTheme | undefined,
	token: MarkdownPreviewStyleToken,
	value: string,
): string {
	const styled = theme?.style(token, value) ?? value;
	return styleMarkdownFixedAnsi(
		token,
		styleMarkdownHeadingBackground(token, styled),
	);
}
