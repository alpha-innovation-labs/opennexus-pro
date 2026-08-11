/**
 * Calculates left padding needed to center a promptline frame inside the terminal.
 *
 * @param terminalWidth Current render width.
 * @param frameWidth Promptline frame width.
 * @returns Left padding column count.
 */
export function getPromptlineFrameLeftPadding(
	terminalWidth: number,
	frameWidth: number,
): number {
	return Math.max(0, Math.floor((terminalWidth - frameWidth) / 2));
}
