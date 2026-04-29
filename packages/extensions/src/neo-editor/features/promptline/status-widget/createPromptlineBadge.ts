const BADGE_FG = "\x1b[38;2;255;255;255m";
const RESET = "\x1b[0m";

/**
 * Formats a colored promptline metadata badge.
 *
 * @param text Badge text.
 * @param background Background ANSI code.
 * @returns Styled badge string.
 */
export function createPromptlineBadge(text: string, background: string): string {
	return `${background}${BADGE_FG} ${text} ${RESET}`;
}
