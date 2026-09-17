import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { Markdown, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { isStartupProfileEnabled } from "@nexus/observability/startup-profile/isStartupProfileEnabled";
import { colorBorder } from "./colorBorder";
import { colorContent } from "./colorContent";
import { colorPrefix } from "./colorPrefix";
import { getMetadataInnerWidth } from "./getMetadataInnerWidth";
import type { UserMessageMetadata } from "./metadata/types";
import { renderBottomBorder } from "./renderBottomBorder";

const PROMPT_PREFIX = "» ";

/**
 * Renders the compact bordered user-message bubble.
 *
 * Bubble content is rendered through the same Markdown pipeline the rest of
 * tron uses (Markdown + getMarkdownTheme), so inline Markdown such as
 * `code` spans is styled consistently with assistant content. The base text
 * color stays the user-message content color so the bubble design is kept.
 *
 * @param text User message text.
 * @param width Available width.
 * @param metadata Prompt metadata shown on the bottom border.
 * @returns Rendered lines.
 */
export function renderCompactInputBubble(
	text: string,
	width: number,
	metadata?: UserMessageMetadata,
): string[] {
	const maxInnerWidth = Math.max(1, width - 2);
	const markdown = new Markdown(
		(text || "").replace(/\r\n/g, "\n"),
		0,
		0,
		getMarkdownTheme(),
		{ color: (value: string) => colorContent(value) },
	);
	// Markdown pads every line to the full render width; drop the trailing
	// padding so bubble padding can realign lines to the computed inner width.
	// Reserve space for the first-line prompt prefix before wrapping Markdown.
	const contentWidth = Math.max(1, maxInnerWidth - visibleWidth(PROMPT_PREFIX));
	const markdownLines = markdown.render(contentWidth);
	const rendered = (markdownLines.length > 0 ? markdownLines : [""]).map(
		(line, index) =>
			index === 0
				? `${colorPrefix(PROMPT_PREFIX)}${line.replace(/ +$/, "")}`
				: line.replace(/ +$/, ""),
	);
	const innerWidth = Math.min(
		maxInnerWidth,
		Math.max(
			1,
			getMetadataInnerWidth(metadata),
			...rendered.map((line) => visibleWidth(line)),
		),
	);
	const top = colorBorder(`╭${"─".repeat(innerWidth)}╮`);
	const middle = rendered.map((line) => {
		const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line)));
		return `${colorBorder("│")}${line}${pad}${colorBorder("│")}`;
	});
	const bottom = renderBottomBorder(innerWidth, metadata);
	const lines = [top, ...middle, bottom];
	if (isStartupProfileEnabled()) {
		for (const [index, line] of lines.entries()) {
			const renderedWidth = visibleWidth(line);
			if (renderedWidth > width) {
				logExtensionEvent("user-message-input-style", "overflow", {
					width,
					lineIndex: index,
					renderedWidth,
				});
			}
		}
	}
	// Also cover extremely narrow terminals where borders/prefix cannot fit.
	return lines.map((line) => truncateToWidth(line, Math.max(0, width), ""));
}
