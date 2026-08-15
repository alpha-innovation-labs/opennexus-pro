import { visibleWidth } from "@earendil-works/pi-tui";
import { hasToolCallFrameState } from "../activity/hasToolCallFrameState";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder";
import { measureTronRender } from "../profiling/measureTronRender";

type Themed = { fg(color: string, text: string): string };

/**
 * Wraps a built-in tool result component in nexus borders.
 */
export class BorderedToolResult {
	constructor(
		private readonly toolCallId: string,
		private readonly child: {
			render(width: number): string[];
			invalidate?(): void;
		},
		private readonly theme: Themed,
	) {}

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
				const childLines = this.child.render(innerWidth);
				const lines = childLines.map((line) => {
					const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line)));
					return `${this.theme.fg("borderMuted", "│")}${line}${pad}${this.theme.fg("borderMuted", "│")}`;
				});
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

	/**
	 * Forwards invalidation to the child component.
	 */
	invalidate(): void {
		this.child.invalidate?.();
	}
}
