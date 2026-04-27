/**
 * Shortens text to one compact line.
 *
 * @param text Input text.
 * @param max Maximum output length.
 * @returns Shortened text.
 */
export function shorten(text: string, max = 80): string {
	const oneLine = text.replace(/\s+/g, " ").trim();
	return oneLine.length <= max ? oneLine : `${oneLine.slice(0, Math.max(0, max - 1))}…`;
}
