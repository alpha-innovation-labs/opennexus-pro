import { visibleWidth } from "@mariozechner/pi-tui";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
import { colorBorder } from "./colorBorder.ts";
import { colorContent } from "./colorContent.ts";
import { colorPrefix } from "./colorPrefix.ts";
import { wrapPlainText } from "./wrapPlainText.ts";

/**
 * Renders the compact bordered user-message bubble.
 *
 * @param text User message text.
 * @param width Available width.
 * @returns Rendered lines.
 */
export function renderCompactInputBubble(text: string, width: number): string[] {
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
	const innerWidth = Math.max(1, ...rendered.map((line) => visibleWidth(line.plain)));
	const top = colorBorder(`╭${"─".repeat(innerWidth)}╮`);
	const middle = rendered.map((line) => {
		const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line.plain)));
		return `${colorBorder("│")}${line.styled}${pad}${colorBorder("│")}`;
	});
	const bottom = colorBorder(`╰${"─".repeat(innerWidth)}╯`);
	const lines = [top, ...middle, bottom];
	for (const [index, line] of lines.entries()) {
		const renderedWidth = visibleWidth(line);
		if (renderedWidth > width) {
			logExtensionEvent("user-message-input-style", "overflow", { width, lineIndex: index, renderedWidth });
		}
	}
	return lines;
}
