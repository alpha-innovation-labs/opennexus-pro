/**
 * Removes a leading markdown bullet marker from a line.
 *
 * @param line Raw markdown line.
 * @returns Plain bullet text.
 */
export function stripMarkdownBullet(line: string): string {
	return line.replace(/^\s*[-*]\s*/, "").trim();
}
