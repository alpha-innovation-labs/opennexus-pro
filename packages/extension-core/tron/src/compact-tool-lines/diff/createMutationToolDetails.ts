import type { Theme } from '@earendil-works/pi-coding-agent';
import type { EntryRenderer } from '../../transcript/types';
import { DiffRenderer } from './DiffRenderer';

/**
 * Factory that creates a mutation-tool detail renderer with Tron colors.
 *
 * NOTE: the live factory is the top-level `compact-tool-lines/createMutationToolDetails.ts`.
 * This copy is kept in sync for the barrel but is not the one the transcript imports.
 */
export function createMutationToolDetails(
	toolName: string,
	args: Record<string, unknown> | undefined,
	details: unknown,
	theme: Theme,
	toolCallId: string,
): EntryRenderer | undefined {
	// Write tool: render raw content or `[empty file]` placeholder.
	if (toolName === 'write' && typeof args?.content === 'string') {
		const text = args.content.length === 0
			? theme.fg('muted', '[empty file]')
			: theme.fg('toolOutput', args.content.replace(/\t/g, '    '));
		return { render: () => [text] };
	}

	// Only edit tools produce diffs.
	if (toolName !== 'edit') return undefined;

	const path = typeof args?.path === 'string' ? args.path : undefined;

	// The executed diff is authoritative.
	const diff = details && typeof details === 'object' && 'diff' in details
		? details.diff : undefined;

	if (typeof diff === 'string' && diff.trim()) {
		return new DiffRenderer(diff, theme, { toolCallId, verb: 'edit', path });
	}

	// Fallback: construct numbered-format diff from edits array.
	const edits = Array.isArray(args?.edits) ? args.edits : [];
	if (!edits.length) return undefined;

	const fallbackLines: string[] = [];
	for (const edit of edits) {
		if (edit && typeof edit === 'object') {
			const o = edit as Record<string, unknown>;
			if (typeof o.oldText === 'string' && typeof o.newText === 'string') {
				const removed = o.oldText.split('\n').map((l: string) => `- ${l}`);
				const added = o.newText.split('\n').map((l: string) => `+ ${l}`);
				fallbackLines.push([...removed, ...added].join('\n'));
			}
		}
	}

	if (!fallbackLines.length) return undefined;
	const fallbackDiff = fallbackLines.join('\n');
	return new DiffRenderer(fallbackDiff, theme, { toolCallId, verb: 'edit', path });
}
