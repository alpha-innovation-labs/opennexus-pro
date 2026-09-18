import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import { hasToolCallFrameState } from "../activity/hasToolCallFrameState";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder";
import { measureTronRender } from "../profiling/measureTronRender";
import { getResultText } from "./getResultText";

/**
 * Compact text-only tool result renderer.
 */
export class CompactToolResult {
	constructor(
		private readonly toolCallId: string,
		private readonly result: AgentToolResult<any>,
		private readonly expanded: boolean,
		private readonly theme: { fg(color: string, text: string): string },
	) {}

	/**
	 * Renders the compact tool result.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		return measureTronRender(
			"compact-tool-result",
			() => {
				if (!this.expanded) return [];
				const text = getResultText(this.result);
				if (!text) return [];
				const innerWidth = Math.max(1, width - 2);
				// Top border (├──┤) separates the header row from the body text, matching
				// BorderedToolResult. This renderer has no mouse handler, so no y offset.
				const lines = [
					this.theme.fg("borderMuted", `├${"─".repeat(innerWidth)}┤`),
					...text.split("\n").map((line) => {
						const clean = line.replace(/\t/g, "    ");
						const truncated = truncateToWidth(clean, innerWidth, "…");
						const pad = " ".repeat(
							Math.max(0, innerWidth - visibleWidth(truncated)),
						);
						return `${this.theme.fg("borderMuted", "│")}${this.theme.fg("toolOutput", truncated)}${pad}${this.theme.fg("borderMuted", "│")}`;
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
			{ width, expanded: this.expanded },
		);
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
