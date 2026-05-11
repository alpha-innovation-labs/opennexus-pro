/**
 * Counts visible lines in one content string.
 *
 * @param content Text content to measure.
 * @returns Line count.
 */
export function countContentLines(content: string | undefined): number {
	if (!content) return 0;
	return content.split("\n").length;
}
