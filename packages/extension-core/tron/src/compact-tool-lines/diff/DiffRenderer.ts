import { visibleWidth } from '@earendil-works/pi-tui';
import type { TuiMouseEvent, TuiMouseEventResult } from '@earendil-works/pi-tui';
import type { Theme } from '@earendil-works/pi-coding-agent';
import { parseDiffLines } from './parsers';
import { countChanges } from './stats';
import type { DiffLine, DiffMode, HighlightFn } from './types';
import { getDiffState, setDiffState, getDiffScrollState } from './state';
import { renderUnified } from './viewers/unified';
import { renderSplit } from './viewers/split';
import { renderSummary } from './viewers/summary';
import type { ToolOutputScrollState } from '../ToolOutputViewport';
import { ExpandableOutput } from '../ExpandableOutput';
import { SyntaxHighlighter } from '../highlight';
import type { EntryRenderer } from '../../transcript/types';

export interface DiffRendererOptions {
	toolCallId?: string;
	verb?: string;
	path?: string;
}

const BAR = '━';
const BAR_WIDTH = 10;

function plural(n: number, singular: string): string {
	return n === 1 ? singular : `${singular}s`;
}

/**
 * Renders a unified diff in the `▌`/`│` column layout inside a fixed-height box.
 *
 * Top to bottom:
 *   - a **pinned** mode/stats bar (always the first line, never scrolls),
 *   - an **ExpandableOutput** body: capped at 30 rows. Short diffs show in full;
 *     long diffs show a `▸ show more` footer until clicked, then become a
 *     scrollable body (wheel + `█` scrollbar) with a `▾ show less` footer.
 *
 * The mode bar is drawn OUTSIDE the scroll region so it stays pinned at the top
 * no matter how far the body is scrolled.
 *
 * Framing (side `│` borders + bottom `└──┘`) is `BorderedToolResult`'s job; this
 * renderer draws no rules of its own.
 *
 * View state: `mode` and the expand/collapse toggle are stored per toolCallId
 * (see {@link state} / {@link ExpandableOutput}); body scroll position is stored
 * per toolCallId as a persistent object the viewport mutates. The renderer is
 * rebuilt each transcript pass, so all of it is recovered here.
 */
export class DiffRenderer {
	private readonly lines: DiffLine[];
	private readonly stats: ReturnType<typeof countChanges>;
	private mode: DiffMode;
	/** The mode actually rendered on the last `render()` call (summary/unified/split). */
	effectiveMode: DiffMode = 'unified';
	private readonly toolCallId: string | undefined;
	private readonly verb: string;
	private readonly path: string;
	private readonly theme: Theme;
	private readonly highlighter: SyntaxHighlighter;
	private readonly scrollState: ToolOutputScrollState;
	private readonly body: EntryRenderer;
	private readonly output: ExpandableOutput;

	constructor(diffString: string, theme: Theme, options: DiffRendererOptions = {}) {
		this.theme = theme;
		this.lines = parseDiffLines(diffString);
		this.stats = countChanges(this.lines);
		const state = options.toolCallId ? getDiffState(options.toolCallId) : undefined;
		this.mode = state?.mode ?? 'unified';
		this.toolCallId = options.toolCallId;
		this.verb = options.verb ?? 'edit';
		this.path = options.path ?? '';
		this.highlighter = new SyntaxHighlighter(this.path || undefined, this.theme);

		// Persistent per-toolCallId scroll object: the viewport mutates it on
		// wheel/drag, and it survives this renderer being rebuilt on the next pass.
		this.scrollState = options.toolCallId ? getDiffScrollState(options.toolCallId) : { top: 0 };
		this.body = {
			render: (width: number) => this.renderBody(width),
			invalidate: () => {},
		};
		this.output = new ExpandableOutput(this.body, this.scrollState, this.theme, this.toolCallId ?? '');
	}

	/** The unified/split body rows (the scrollable region, excluding the mode bar). */
	private renderBody(width: number): string[] {
		const highlight: HighlightFn = (content: string) => this.highlighter.highlightLine(content);
		return this.mode === 'split'
			? renderSplit(this.lines, width, this.theme, highlight)
			: renderUnified(this.lines, width, this.theme, highlight);
	}

	render(width: number): string[] {
		this.effectiveMode =
			width < 40 || this.stats.added + this.stats.removed > 200 ? 'summary' : this.mode;
		if (this.effectiveMode === 'summary') {
			return [this.renderModeBar(width), ...renderSummary(this.stats, width, this.theme, this.verb, this.path)];
		}
		// Pinned mode bar (line 0, never scrolls) + expandable body (preview/button or
		// scrollable rows).
		return [this.renderModeBar(width), ...this.output.render(width)];
	}

	/**
	 * Forward mouse events to the body, offsetting `y` by one to skip the pinned
	 * mode bar. The ExpandableOutput handles the footer button and, when expanded,
	 * the wheel + scrollbar. A click on the (stateless) body is left unhandled so
	 * pi's `MouseRegion` collapses the tool (click-to-collapse).
	 */
	handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
		const y = Math.max(0, event.y - 1);
		return this.output.handleMouse({ ...event, y, height: Math.max(0, event.height - 1) });
	}

	/** No internal caches to clear; view state lives in the per-toolCallId maps. */
	invalidate(): void {
		// no-op
	}

	/** Set the view mode and persist it for subsequent renders of this tool. */
	setMode(mode: DiffMode): void {
		this.mode = mode;
		if (this.toolCallId) {
			setDiffState(this.toolCallId, { mode });
		}
	}

	/**
	 * `↳ diff • +A • -R • H hunks • F file(s) • mode [bar]`
	 *
	 * The bar is a green/red ratio meter: green cells on the left are proportional
	 * to added lines and red cells on the right to removed lines (`added:removed`).
	 * Pinned — always the first line of the box, above the scroll region.
	 */
	private renderModeBar(width: number): string {
		const { added, removed, hunks, files } = this.stats;
		const bar = this.renderBar(added, removed);
		const modeText =
			this.effectiveMode === 'split'
				? this.theme.fg('syntaxType', 'split')
				: this.effectiveMode === 'summary'
					? this.theme.fg('warning', 'summary')
					: this.theme.fg('success', 'unified');
		const statsText = this.theme.fg(
			'muted',
			`+${added} • -${removed} • ${hunks} ${plural(hunks, 'hunk')} • ${files} ${plural(files, 'file')} • ${modeText}`,
		);
		const raw = `↳ ${this.theme.fg('toolOutput', 'diff')} ${statsText} ${bar}`;
		return this.pad(raw, width);
	}

	/** `[━━━━━─────]`: green ∝ added on the left, red ∝ removed on the right. */
	private renderBar(added: number, removed: number): string {
		const total = added + removed;
		const bracketOpen = this.theme.fg('muted', '[');
		const bracketClose = this.theme.fg('muted', ']');
		if (total === 0) {
			return `${bracketOpen}${this.theme.fg('borderMuted', BAR.repeat(BAR_WIDTH))}${bracketClose}`;
		}
		const greenCells = Math.round((added / total) * BAR_WIDTH);
		const redCells = BAR_WIDTH - greenCells;
		const green = this.theme.fg('success', BAR.repeat(greenCells));
		const red = this.theme.fg('error', BAR.repeat(redCells));
		return `${bracketOpen}${green}${red}${bracketClose}`;
	}

	private pad(text: string, width: number): string {
		const vw = visibleWidth(text);
		return vw >= width ? text : `${text}${' '.repeat(width - vw)}`;
	}
}
