import { isEditorBorderLine } from "./isEditorBorderLine";

/**
 * Extracts only the content lines from the stock editor render output.
 *
 * @param lines Full editor render output.
 * @returns Inner content lines.
 */
export function extractEditorContentLines(lines: string[]): string[] {
	const result: string[] = [];
	let seenTop = false;
	for (const line of lines) {
		if (isEditorBorderLine(line)) {
			if (!seenTop) {
				seenTop = true;
				continue;
			}
			break;
		}
		if (seenTop) result.push(line);
	}
	return result;
}
