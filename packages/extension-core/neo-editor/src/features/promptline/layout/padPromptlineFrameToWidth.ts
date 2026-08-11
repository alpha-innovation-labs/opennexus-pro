import { getPromptlineFrameLeftPadding } from "./getPromptlineFrameLeftPadding";

/**
 * Pads promptline frame lines so compact startup input is centered in the terminal.
 *
 * @param lines Promptline frame lines.
 * @param terminalWidth Current render width.
 * @param frameWidth Promptline frame width before outer padding.
 * @returns Promptline frame lines with left padding applied.
 */
export function padPromptlineFrameToWidth(
	lines: string[],
	terminalWidth: number,
	frameWidth: number,
): string[] {
	const leftPadding = " ".repeat(
		getPromptlineFrameLeftPadding(terminalWidth, frameWidth),
	);
	return lines.map((line) => `${leftPadding}${line}`);
}
