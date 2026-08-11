/**
 * Removes the active trigger prefix from editor lines.
 *
 * @param lines Current editor lines.
 * @param cursorLine Cursor line index.
 * @param cursorCol Cursor column index.
 * @param prefix Trigger prefix before the cursor.
 * @returns Editor text with the trigger prefix removed.
 */
export function removeTriggerPrefixFromLines(
	lines: string[],
	cursorLine: number,
	cursorCol: number,
	prefix: string,
): string {
	if (!prefix) return lines.join("\n");
	const nextLines = [...lines];
	const line = nextLines[cursorLine] ?? "";
	const prefixStart = Math.max(0, cursorCol - prefix.length);
	nextLines[cursorLine] =
		`${line.slice(0, prefixStart)}${line.slice(cursorCol)}`;
	return nextLines.join("\n");
}
