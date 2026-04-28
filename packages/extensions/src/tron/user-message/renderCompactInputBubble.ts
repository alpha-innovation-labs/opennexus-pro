import { visibleWidth } from "@mariozechner/pi-tui";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { colorBorder } from "./colorBorder.ts";
import { colorContent } from "./colorContent.ts";
import { colorPrefix } from "./colorPrefix.ts";
import { getMetadataInnerWidth } from "./getMetadataInnerWidth.ts";
import type { UserMessageMetadata } from "./metadata/types.ts";
import { renderBottomBorder } from "./renderBottomBorder.ts";
import { wrapPlainText } from "./wrapPlainText.ts";

/**
 * Renders the compact bordered user-message bubble.
 *
 * @param text User message text.
 * @param width Available width.
 * @param metadata Prompt metadata shown on the bottom border.
 * @returns Rendered lines.
 */
export function renderCompactInputBubble(text: string, width: number, metadata?: UserMessageMetadata): string[] {
	const maxInnerWidth = Math.max(1, width - 2);
	const rawLines = (text || "").replace(/\r\n/g, "\n").split("\n");
	const contentLines = rawLines.length > 0 ? rawLines : [""];
	const rendered = contentLines.flatMap((line, index) => {
		const prefix = index === 0 ? "» " : "";
		const wrapped = wrapPlainText(`${prefix}${line}`, maxInnerWidth);
		return wrapped.map((segment, segmentIndex) => ({
			plain: segment,
			styled:
				index === 0 && segmentIndex === 0 && segment.startsWith("» ")
					? `${colorPrefix("» ")}${colorContent(segment.slice(2))}`
					: colorContent(segment),
		}));
	});
	const innerWidth = Math.min(
		maxInnerWidth,
		Math.max(1, getMetadataInnerWidth(metadata), ...rendered.map((line) => visibleWidth(line.plain))),
	);
	const top = colorBorder(`╭${"─".repeat(innerWidth)}╮`);
	const middle = rendered.map((line) => {
		const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line.plain)));
		return `${colorBorder("│")}${line.styled}${pad}${colorBorder("│")}`;
	});
	const bottom = renderBottomBorder(innerWidth, metadata);
	const lines = [top, ...middle, bottom];
	for (const [index, line] of lines.entries()) {
		const renderedWidth = visibleWidth(line);
		if (renderedWidth > width) {
			logExtensionEvent("user-message-input-style", "overflow", { width, lineIndex: index, renderedWidth });
		}
	}
	return lines;
}
