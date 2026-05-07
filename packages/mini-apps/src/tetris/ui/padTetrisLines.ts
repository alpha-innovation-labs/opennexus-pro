/**
 * Pads a line array to a fixed height.
 *
 * @param lines Existing lines.
 * @param height Target height.
 * @returns Height-normalized lines.
 */
export function padTetrisLines(lines: string[], height: number): string[] {
	const next = lines.slice(0, height);
	while (next.length < height) next.push("");
	return next;
}
