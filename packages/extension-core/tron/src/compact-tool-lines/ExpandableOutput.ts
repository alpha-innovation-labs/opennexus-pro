import { truncateToWidth, visibleWidth, type TuiMouseEvent, type TuiMouseEventResult } from "@earendil-works/pi-tui";
import { MAX_TOOL_OUTPUT_ROWS, ToolOutputViewport, type ToolOutputScrollState } from "./ToolOutputViewport";
import type { EntryRenderer } from "../transcript/types";

type Themed = { fg(color: string, text: string): string };

/**
 * Per-toolCallId "show more / show less" toggle. Keyed by tool call so the flag
 * survives the renderer being rebuilt on the next transcript pass. Defaults to
 * collapsed (show the capped preview + footer button).
 */
const outputExpanded = new Map<string, boolean>();

/** Whether the given tool's output is expanded (scrollable) or collapsed (preview + button). */
export function getOutputExpanded(toolCallId: string): boolean {
	return outputExpanded.get(toolCallId) ?? false;
}

/** Set the expanded flag for one tool call. */
export function setOutputExpanded(toolCallId: string, expanded: boolean): void {
	outputExpanded.set(toolCallId, expanded);
}

/** Reset the flag so a fresh re-expansion starts collapsed (preview + button). */
export function resetOutputExpanded(toolCallId: string): void {
	outputExpanded.delete(toolCallId);
}

/**
 * A body of tool output with a "show more / show less" footer.
 *
 * Content is capped at {@link MAX_TOOL_OUTPUT_ROWS} rows.
 *   - When the body FITS (≤ cap): all rows are shown, no scrollbar, no button.
 *   - When the body OVERFLOWS ( > cap):
 *       - **collapsed** (default): the top `cap` rows are shown with NO scrollbar,
 *         plus a `▸ show more` footer button. Clicking it expands.
 *       - **expanded**: `cap` rows are shown WITH a `█` scrollbar (wheel + drag),
 *         plus a `▾ show less` footer button. Clicking it collapses.
 *
 * The component draws no box framing — the enclosing `BorderedToolResult` adds
 * the side `│` borders, the `├──┤` top border, and the `└──┘` bottom border.
 * A pinned header row (e.g. the diff mode bar) is the caller's job and sits
 * above this component.
 */
export class ExpandableOutput {
	private width = 0;
	private totalRows = 0;
	private bodyRows = 0;
	private overflow = false;
	private readonly viewport: ToolOutputViewport;

	constructor(
		private readonly child: EntryRenderer,
		private readonly scroll: ToolOutputScrollState,
		private readonly theme: Themed,
		private readonly toolCallId: string,
	) {
		this.viewport = new ToolOutputViewport(child, scroll, (text) => theme.fg("borderMuted", text));
	}

	/** The expanded flag, read live so a rebuild recovers the previous state. */
	private get expanded(): boolean {
		return getOutputExpanded(this.toolCallId);
	}

	private set expanded(value: boolean) {
		setOutputExpanded(this.toolCallId, value);
	}

	/**
	 * Renders the body rows (no side borders). The last row is the footer button
	 * when the body overflows the cap; otherwise there is no button row.
	 */
	render(width: number): string[] {
		this.width = width;
		if (width <= 0) {
			this.totalRows = this.bodyRows = 0;
			this.overflow = false;
			return [];
		}
		const lines = this.child.render(width);
		this.totalRows = lines.length;
		this.bodyRows = Math.min(MAX_TOOL_OUTPUT_ROWS, lines.length);
		this.overflow = lines.length > MAX_TOOL_OUTPUT_ROWS;

		if (!this.overflow) {
			// Fits: show everything, no scrollbar, no button.
			return lines.map((line) => truncateToWidth(line, width, ""));
		}

		if (this.expanded) {
			// Scrollable: the viewport draws the cap rows with a scrollbar.
			const rows = this.viewport.render(width);
			return [...rows, this.renderButton(false)];
		}

		// Collapsed: a window of `bodyRows` rows at the current scroll offset, no
		// scrollbar, plus a "show more" button. Offsetting (instead of always the top)
		// makes collapsing ("show less") stick to whatever the user was looking at.
		const offset = Math.max(0, Math.min(this.scroll.top, Math.max(0, lines.length - this.bodyRows)));
		const top = lines.slice(offset, offset + this.bodyRows).map((line) => truncateToWidth(line, width, ""));
		return [...top, this.renderButton(true)];
	}

	/**
	 * Handles mouse events in this component's frame (row 0 = first body row; the
	 * last row is the button when overflowing). The footer button toggles
	 * expand/collapse; when expanded, wheel/scrollbar events forward to the
	 * viewport. When collapsed the body is not scrollable — only the button works.
	 */
	handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
		if (this.width === 0) return undefined;

		// Footer button occupies the last row when overflowing.
		if (this.overflow && event.y === this.bodyRows) {
			if (event.type === "click" && event.button === "left") {
				this.expanded = !this.expanded;
				if (this.expanded) this.scroll.top = this.scroll.top; // keep current top
				return { handled: true, render: true };
			}
			// A non-left click on the button: swallow so the tool doesn't collapse.
			return event.type === "click" ? { handled: true, render: false } : undefined;
		}

		// Only the expanded (scrollable) body forwards to the viewport.
		if (this.overflow && this.expanded) {
			return this.viewport.handleMouse(event);
		}

		// Collapsed body or non-overflow: nothing to scroll. Return undefined so the
		// enclosing MouseRegion collapses the tool on a completed click.
		return undefined;
	}

	/** `▸ show more (N more)` when collapsed, `▾ show less` when expanded. */
	private renderButton(showMore: boolean): string {
		const glyph = this.theme.fg("dim", showMore ? "▸" : "▾");
		const label = this.theme.fg("accent", showMore ? "show more" : "show less");
		const more = showMore ? this.theme.fg("muted", ` (${this.totalRows - this.bodyRows} more)`) : "";
		const raw = `${glyph} ${label}${more}`;
		return this.pad(raw, this.width);
	}

	private pad(text: string, width: number): string {
		const vw = visibleWidth(text);
		return vw >= width ? text : `${text}${" ".repeat(width - vw)}`;
	}

	/** Forwards invalidation to the child without resetting scroll/expand state. */
	invalidate(): void {
		this.child.invalidate?.();
		this.viewport.invalidate();
	}
}
