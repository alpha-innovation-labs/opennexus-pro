import type { Theme } from "@earendil-works/pi-coding-agent";
import { visibleWidth, type Component, type TuiMouseEvent } from "@earendil-works/pi-tui";
import { dispatchMouseEvent } from "@earendil-works/pi-tui/dist/tui.js";
import type { ToolOutputScrollState } from "./ToolOutputViewport";
import { ExpandableOutput } from "./ExpandableOutput";
import type { EntryRenderer } from "../transcript/types";
import { hasToolCallFrameState } from "../activity/hasToolCallFrameState";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder";
import { measureTronRender } from "../profiling/measureTronRender";

type Themed = { fg(color: string, text: string): string };

/**
 * Wraps a built-in tool result component in nexus borders.
 */
export class BorderedToolResult {
	private readonly content: EntryRenderer;
	private bodyRows = 0;
	private renderedWidth = 0;
	constructor(
		private readonly toolCallId: string,
		child: EntryRenderer,
		private readonly theme: Themed,
		scrollState?: ToolOutputScrollState,
	) {
		// A scrollState means "cap + show more/less footer". The ExpandableOutput owns
		// the 30-row preview, the footer button, the expand toggle, and the viewport.
		// A DiffRenderer brings its own, so it is passed with scrollState = undefined.
		this.content = scrollState ? new ExpandableOutput(child, scrollState, theme, toolCallId) : child;
	}

	/**
	 * Renders the bordered result block.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		return measureTronRender(
			"bordered-tool-result",
			() => {
				const innerWidth = Math.max(1, width - 2);
				const childLines = this.content.render(innerWidth);
				this.bodyRows = childLines.length;
				this.renderedWidth = width;
				// Top border (├──┤) separates the header row from the body text and
				// continues the box's left/right edges. Content occupies rows 1..N
				// below it; handleMouse accounts for this offset.
				const lines = [
					this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`),
					...childLines.map((line) => {
						const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line)));
						return `${this.theme.fg("borderMuted", "│")}${line}${pad}${this.theme.fg("borderMuted", "│")}`;
					}),
				];
				const hasFrameState = hasToolCallFrameState(this.toolCallId);
				if (
					hasFrameState ? shouldShowToolCallBottomBorder(this.toolCallId) : true
				) {
					lines.push(
						this.theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`),
					);
				}
				return lines;
			},
			{ width, toolCallId: this.toolCallId },
		);
	}

	handleMouse(event: TuiMouseEvent) {
		// y=0 is the top border (├──┤); body content occupies y in [1, bodyRows].
		if (event.width !== this.renderedWidth || event.x < 1 || event.x >= event.width - 1
			|| event.y < 1 || event.y >= Math.min(this.bodyRows + 1, event.height)) return undefined;
		return dispatchMouseEvent(this.content as Component, {
			...event, x: event.x - 1, y: event.y - 1, width: Math.max(1, event.width - 2), height: this.bodyRows,
		});
	}

	/** Forwards invalidation without resetting the tool's scroll position. */
	invalidate(): void {
		this.content.invalidate?.();
	}
}
