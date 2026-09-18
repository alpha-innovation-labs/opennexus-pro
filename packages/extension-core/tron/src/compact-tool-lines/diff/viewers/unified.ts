import type { Theme } from '@earendil-works/pi-coding-agent';
import { truncateToWidth, visibleWidth } from '@earendil-works/pi-tui';
import type { DiffLine, HighlightFn } from '../types';
import { maxLineNumWidth } from '../parsers';
import { rightAlign } from '../utils';

const TAB = '    ';
const GUTTER = '│';
const MARKER = '▌';

function replaceTabs(s: string): string {
	return s.replace(/\t/g, TAB);
}

/** Word-wrap plain text to `width` visible columns on word boundaries. */
function wordWrap(text: string, width: number): string[] {
	if (width <= 0) return [text];
	const out: string[] = [];
	for (const hardLine of text.split('\n')) {
		if (visibleWidth(hardLine) <= width) {
			out.push(hardLine);
			continue;
		}
		const words = hardLine.split(' ');
		let current = '';
		for (const word of words) {
			if (current === '') {
				current = word;
			} else if (visibleWidth(`${current} ${word}`) <= width) {
				current = `${current} ${word}`;
			} else {
				out.push(current);
				current = word;
			}
		}
		if (current !== '') out.push(current);
	}
	return out;
}

/**
 * Render diff lines in the unified `▌`/`│` column layout.
 *
 * No `+`/`-` prefixes: changed lines are identified by the `▌` marker + color only.
 * Context (unchanged) lines are syntax-highlighted when `highlight` is provided and
 * the line fits on a single row; long context lines fall back to flat-color wrapping.
 * Returns every body row (the renderer applies the row cap + footer).
 */
export function renderUnified(
	lines: DiffLine[],
	width: number,
	theme: Theme,
	highlight?: HighlightFn,
): string[] {
	if (!lines.length) return [];

	const numFieldWidth = Math.max(6, maxLineNumWidth(lines) + 3) - 3;
	const fieldWidth = numFieldWidth + 3; // lead space + marker + number field + trail space
	const gutter = theme.fg('borderMuted', GUTTER);
	const contentWidth = width - (fieldWidth + 2);

	const rows: string[] = [];

	for (const line of lines) {
		const isChanged = line.type !== 'context';
		const isElision = line.type === 'context' && line.lineNum === '' && line.content === '...';
		const role = line.type === 'added' ? 'success' : line.type === 'removed' ? 'error' : 'toolDiffContext';

		// Fixed prefix: [lead space][marker][right-aligned number][trail space].
		const markerColored = isChanged ? theme.fg(role, MARKER) : ' ';
		const numberPlain = line.lineNum ? rightAlign(line.lineNum, numFieldWidth) : ' '.repeat(numFieldWidth);
		const blankNumber = ' '.repeat(numFieldWidth);

		const content = replaceTabs(line.content);
		const contentRole = isElision ? 'muted' : role;

		// Context (unchanged) lines get per-token syntax highlighting when a
		// highlighter is available and the whole line fits on one row. Long context
		// lines (and all changed lines) wrap on the plain text and use a flat role
		// color so ANSI sequences are never split across a wrap boundary.
		let styledSegments: string[];
		if (!isChanged && !isElision && highlight) {
			const highlighted = highlight(content);
			styledSegments =
				highlighted !== undefined && visibleWidth(highlighted) <= contentWidth
					? [highlighted]
					: wordWrap(content, contentWidth).map(segment => theme.fg(contentRole, segment));
		} else {
			const segments = isElision ? ['...'] : wordWrap(content, contentWidth);
			styledSegments = segments.map(segment => theme.fg(contentRole, segment));
		}

		// First row carries the line number; continuation rows repeat the marker but
		// use a blank number field so the gutter stays aligned (see target: `▌    │`).
		styledSegments.forEach((styled, idx) => {
			const numberColored = idx === 0 && line.lineNum ? theme.fg(role, numberPlain) : blankNumber;
			const prefix = ` ${markerColored}${numberColored} `;
			const row = `${prefix}${gutter} ${styled}`;
			rows.push(truncateToWidth(row, width, '…', true));
		});
	}

	return rows;
}
