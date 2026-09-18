import type { DiffLine } from './types';

/**
 * Parse Pi's numbered diff format into structured lines.
 *
 * Format per line: `<prefix><paddedNumber><space><content>` where
 *   - prefix is `+` (added), `-` (removed), or ` ` (context)
 *   - paddedNumber is the line number space-padded to a fixed width (or all spaces
 *     for elision separators)
 *   - content is the rest of the line
 *
 * There are no `@@` hunk headers and no `---`/`+++` file headers. Elision lines are
 * context lines with an empty number and content `...`.
 */
export function parseDiffLines(diff: string): DiffLine[] {
	const result: DiffLine[] = [];

	for (const raw of diff.split('\n')) {
		if (raw === '') continue;

		const prefix = raw[0];
		const rest = raw.slice(1);
		const type: DiffLine['type'] =
			prefix === '+' ? 'added' : prefix === '-' ? 'removed' : 'context';

		// Numbered line: optional padding, then digits, then one space, then content.
		const numMatch = /^(\s*)(\d+)\s(.*)$/.exec(rest);
		if (numMatch) {
			result.push({ type, lineNum: numMatch[2], prefix, content: numMatch[3] });
			continue;
		}

		// Unnumbered: elision separator (`...`) or fallback `- text`/`+ text`.
		const restMatch = /^(\s*)(.*)$/.exec(rest);
		const content = restMatch ? restMatch[2] : rest;
		const isElision = type === 'context' && content.trim() === '...';
		result.push({ type, lineNum: '', prefix, content: isElision ? '...' : content });
	}

	return result;
}

/**
 * Width (in characters) of the largest line number in the parsed set.
 * Used to size the unified line-number field.
 */
export function maxLineNumWidth(lines: DiffLine[]): number {
	let max = 0;
	for (const line of lines) {
		if (line.lineNum.length > max) max = line.lineNum.length;
	}
	return max;
}
