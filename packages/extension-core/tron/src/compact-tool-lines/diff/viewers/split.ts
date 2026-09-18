import type { Theme } from '@earendil-works/pi-coding-agent';
import { truncateToWidth } from '@earendil-works/pi-tui';
import type { DiffLine, HighlightFn } from '../types';
import { padOrTruncate } from '../utils';

const TAB = '    ';

function replaceTabs(s: string): string {
	return s.replace(/\t/g, TAB);
}

/** Group consecutive removed/added into line pairs for side-by-side display. */
export function groupPairs(lines: DiffLine[]): Array<{ removed?: DiffLine; added?: DiffLine }> {
	const result: Array<{ removed?: DiffLine; added?: DiffLine }> = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (line.type === 'context') {
			result.push({ added: line });
			i++;
			continue;
		}
		const removed: DiffLine[] = [];
		while (i < lines.length && lines[i].type === 'removed') {
			removed.push(lines[i++]);
		}
		const added: DiffLine[] = [];
		while (i < lines.length && lines[i].type === 'added') {
			added.push(lines[i++]);
		}
		for (let j = 0; j < Math.max(removed.length, added.length); j++) {
			result.push({
				removed: removed[j],
				added: added[j] ?? removed[j],
			});
		}
	}
	return result;
}

/** Render diff lines in split view using Tron's theme. */
export function renderSplit(
	lines: DiffLine[],
	width: number,
	theme: Theme,
	highlight?: HighlightFn,
): string[] {
	if (!lines.length) return [];
	const groups = groupPairs(lines);
	const gutterWidth = 3; // ` │ ` separator with padding
	const maxContentWidth = Math.max(Math.floor((width - gutterWidth) / 2), 10);

	return groups.map(g => {
		if (g.added && g.added.type === 'context' && !g.removed) {
			return truncateToWidth(formatContext(g.added, theme, highlight), maxContentWidth, '…', true);
		}
		const left = g.removed ? formatRemoved(g.removed, theme) : '';
		const right = g.added ? formatAdded(g.added, theme) : '';
		const combined = `${left}│${right}`;
		return padOrTruncate(combined, width);
	});
}

function formatContext(line: DiffLine, theme: Theme, highlight?: HighlightFn): string {
	const numPad = line.lineNum.padStart(6, ' ');
	const content = replaceTabs(line.content);
	const styled = highlight?.(content) ?? theme.fg('toolDiffContext', content);
	return `${numPad} ${styled}`;
}

function formatRemoved(line: DiffLine, theme: Theme): string {
	const numPad = line.lineNum.padStart(6, ' ');
	return `${theme.fg('error', `- ${numPad} ${replaceTabs(line.content)}`)}`;
}

function formatAdded(line: DiffLine, theme: Theme): string {
	const numPad = line.lineNum.padStart(6, ' ');
	return `${theme.fg('success', `+ ${numPad} ${replaceTabs(line.content)}`)}`;
}
