import type { ChangeStats, DiffLine } from './types';

/**
 * Count added/removed lines and the number of hunks.
 *
 * A hunk is one contiguous run of added/removed lines. A single run may contain both
 * removed and added lines (a replacement) and still counts as one hunk.
 */
export function countChanges(lines: DiffLine[]): ChangeStats {
	let added = 0;
	let removed = 0;
	let hunks = 0;
	let inHunk = false;

	for (const line of lines) {
		if (line.type === 'added') added++;
		if (line.type === 'removed') removed++;
		if (line.type !== 'context') {
			if (!inHunk) {
				hunks++;
				inHunk = true;
			}
		} else {
			inHunk = false;
		}
	}

	return { added, removed, total: added + removed, hunks, files: 1 };
}
