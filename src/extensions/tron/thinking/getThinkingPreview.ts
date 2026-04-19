/**
 * Picks a compact preview line from a hidden thinking block.
 *
 * @param text Raw thinking text.
 * @returns Preview line.
 */
export function getThinkingPreview(text: string): string {
	const rawLines = text.replace(/\r\n/g, "\n").split("\n");
	const preferredLine = rawLines[2]?.trim();
	if (preferredLine) return preferredLine;
	return rawLines.map((line) => line.trim()).find(Boolean) ?? "";
}
