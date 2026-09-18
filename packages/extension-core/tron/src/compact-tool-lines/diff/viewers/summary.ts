import type { Theme } from '@earendil-works/pi-coding-agent';
import { truncateToWidth } from '@earendil-works/pi-tui';
import type { ChangeStats } from '../types';
import { middleTruncatePath } from '../utils';

/**
 * Render a compact one-line summary: `+A -R  •  <verb> <truncated-path>`.
 */
export function renderSummary(
	stats: ChangeStats,
	width: number,
	theme: Theme,
	verb: string,
	path: string | undefined,
): string[] {
	const statsStr = `${theme.fg('syntaxType', `+${stats.added}`)} ${theme.fg('error', `-${stats.removed}`)}`;
	const pathMax = Math.max(8, width - 24);
	const label = path ? `${verb} ${middleTruncatePath(path, pathMax)}` : verb;
	const line = `${statsStr}  ${theme.fg('muted', `•  ${label}`)}`;
	return [truncateToWidth(line, width, '…', true)];
}
