import { stripAnsi } from "./stripAnsi.js";

/**
 * Returns whether the rendered editor line is one of the stock borders.
 *
 * @param line Rendered editor line.
 * @returns Whether it is a border line.
 */
export function isEditorBorderLine(line: string): boolean {
	const stripped = stripAnsi(line).trim();
	return /^─+(?:\s[↑↓].*)?$/.test(stripped);
}
