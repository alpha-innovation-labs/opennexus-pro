import { styleExitBorder } from "./styleExitCommand";

export interface PurpleBoxLine {
	text: string;
	style?: (text: string) => string;
}

/**
 * Wraps lines in a purple terminal box while keeping content inside the border.
 *
 * @param lines Content lines to render.
 * @param maxWidth Maximum full box width.
 * @returns Purple boxed text.
 */
export function formatPurpleBox(lines: PurpleBoxLine[], maxWidth = process.stdout.columns ?? 80): string {
	const contentWidth = getContentWidth(lines, maxWidth);
	const wrappedLines = lines.flatMap((line) => wrapBoxLine(line, contentWidth));
	const top = styleExitBorder(`╭${"─".repeat(contentWidth + 2)}╮`);
	const bottom = styleExitBorder(`╰${"─".repeat(contentWidth + 2)}╯`);
	const body = wrappedLines.map((line) => {
		const padding = " ".repeat(contentWidth - line.text.length);
		return `${styleExitBorder("│ ")}${line.style ? line.style(line.text) : line.text}${padding}${styleExitBorder(" │")}`;
	});
	return [top, ...body, bottom].join("\n");
}

/**
 * Computes a safe content width for the current terminal.
 *
 * @param lines Content lines.
 * @param maxWidth Maximum full box width.
 * @returns Content width.
 */
function getContentWidth(lines: PurpleBoxLine[], maxWidth: number): number {
	const longest = Math.max(...lines.map((line) => line.text.length), 20);
	const terminalSafeWidth = Math.max(20, maxWidth - 4);
	return Math.min(longest, terminalSafeWidth);
}

/**
 * Wraps one box line to the content width.
 *
 * @param line Content line.
 * @param width Content width.
 * @returns Wrapped lines preserving style callback.
 */
function wrapBoxLine(line: PurpleBoxLine, width: number): PurpleBoxLine[] {
	if (line.text.length <= width) return [line];
	const chunks: PurpleBoxLine[] = [];
	let remaining = line.text;
	while (remaining.length > width) {
		let splitAt = remaining.lastIndexOf(" ", width);
		if (splitAt < Math.floor(width * 0.5)) splitAt = width;
		chunks.push({ text: remaining.slice(0, splitAt).trimEnd(), style: line.style });
		remaining = remaining.slice(splitAt).trimStart();
	}
	if (remaining) chunks.push({ text: remaining, style: line.style });
	return chunks;
}
