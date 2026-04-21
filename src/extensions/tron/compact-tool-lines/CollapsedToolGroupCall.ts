import { CompactToolRow } from "../shared/compact-row/CompactToolRow.ts";
import { shouldBridgeThinkingToTool } from "../activity/shouldBridgeThinkingToTool.ts";
import { getCollapsedToolGroupSummary } from "../activity/getCollapsedToolGroupSummary.ts";

/**
 * Compact single-row renderer for a collapsed tool group.
 */
export class CollapsedToolGroupCall {
	constructor(
		private readonly toolCallId: string,
		private readonly theme: any,
	) {}

	/**
	 * Renders one collapsed tool-group summary row.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const summary = getCollapsedToolGroupSummary(this.toolCallId);
		const diffLabel = `${summary.diffCount} diff${summary.diffCount === 1 ? "" : "s"}`;
		const durationPart = summary.durationLabel ? ` · ${summary.durationLabel}` : "";
		return new CompactToolRow({
			width,
			icon: summary.icon,
			label: diffLabel,
			main: `· ${summary.toolCallCount} tool call${summary.toolCallCount === 1 ? "" : "s"}${durationPart}`,
			theme: this.theme,
			showTopBorder: !shouldBridgeThinkingToTool(summary.leaderToolCallId),
			showBottomBorder: true,
		}).render();
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
