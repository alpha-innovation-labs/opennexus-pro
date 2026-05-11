import * as fs from "node:fs";

/**
 * Builds a zero-indexed LSP position from user line and optional symbol selector.
 *
 * @param filePath File path to inspect.
 * @param line One-indexed line number.
 * @param symbol Optional symbol or symbol#occurrence selector.
 * @returns LSP position object.
 */
export function createPosition(filePath: string, line: number, symbol?: string): { line: number; character: number } {
	const textLine = fs.readFileSync(filePath, "utf8").split(/\r?\n/)[line - 1] ?? "";
	const parsed = parseOccurrence(symbol);
	if (!parsed.value) return { line: line - 1, character: 0 };
	let offset = -1;
	let from = 0;
	for (let index = 0; index < parsed.occurrence; index += 1) {
		offset = textLine.indexOf(parsed.value, from);
		if (offset < 0) throw new Error(`Symbol not found on line ${line}: ${parsed.value}`);
		from = offset + parsed.value.length;
	}
	return { line: line - 1, character: offset };
}

/**
 * Parses Oh My Pi's symbol#N occurrence selector.
 *
 * @param symbol Symbol selector.
 * @returns Symbol value and occurrence number.
 */
function parseOccurrence(symbol?: string): { value?: string; occurrence: number } {
	const match = /^(.*)#(\d+)$/.exec(symbol ?? "");
	if (!match) return { value: symbol, occurrence: 1 };
	return { value: match[1], occurrence: Number(match[2]) };
}
