/** One parsed line from a unified diff output. */
export interface DiffLine {
	readonly type: 'context' | 'added' | 'removed';
	/** Line number as a string, or empty for elision / unnumbered lines. */
	readonly lineNum: string;
	/** The source prefix character (`+`, `-`, ` `). */
	readonly prefix: string;
	/** Raw content without prefix and line number. */
	readonly content: string;
}

/** Summary statistics about a diff. */
export interface ChangeStats {
	readonly added: number;
	readonly removed: number;
	readonly total: number;
	/** Number of contiguous added/removed runs. */
	readonly hunks: number;
	/** Number of files the diff touches (the edit tool is always one). */
	readonly files: number;
}

/** Layout mode for the diff viewer. */
export type DiffMode = 'unified' | 'split' | 'summary';

/**
 * Per-line syntax highlighter. Given a plain (tab-expanded) line of source it
 * returns the styled string, or `undefined` to signal "no highlight available"
 * so the caller falls back to a flat role color.
 */
export type HighlightFn = (content: string) => string | undefined;

/**
 * Per-toolCallId diff view state, recovered across render passes. Body scroll
 * position is stored separately (see {@link getDiffScrollState}) because it is
 * mutated by the viewport on every wheel/drag event.
 */
export interface DiffViewState {
	mode: DiffMode;
}
