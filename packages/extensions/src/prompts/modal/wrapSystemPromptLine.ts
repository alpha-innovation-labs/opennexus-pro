/**
 * Wraps one system-prompt line to the available modal width.
 *
 * @param line Source line to wrap.
 * @param width Available content width.
 * @returns Wrapped display lines.
 */
export function wrapSystemPromptLine(line: string, width: number): string[] {
	if (width <= 0) return [""];
	if (line.length === 0) return [""];

	const rows: string[] = [];
	let rest = line;
	while (rest.length > width) {
		rows.push(rest.slice(0, width));
		rest = rest.slice(width);
	}
	rows.push(rest);
	return rows;
}
