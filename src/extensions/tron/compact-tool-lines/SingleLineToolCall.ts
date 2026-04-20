import { getActivityNeighbors } from "../activity/getActivityNeighbors.ts";
import { shouldBridgeThinkingToTool } from "../activity/shouldBridgeThinkingToTool.ts";
import { toolActivityKey } from "../activity/toolActivityKey.ts";
import { CompactToolRow } from "../shared/compact-row/CompactToolRow.ts";
import { iconForToolName } from "./iconForToolName.ts";
import type { SummaryText } from "./SummaryText.ts";

/**
 * Single-row compact tool-call renderer.
 */
export class SingleLineToolCall {
	constructor(
		private readonly toolCallId: string,
		private readonly toolName: string,
		private readonly summary: SummaryText,
		private readonly theme: any,
		private readonly hasAttachedResult: boolean,
	) {}

	/**
	 * Renders one compact tool-call block.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const { isFirst, isLast } = getActivityNeighbors(toolActivityKey(this.toolCallId));
		return new CompactToolRow({
			width,
			icon: iconForToolName(this.toolName),
			label: this.toolName,
			main: this.summary.main,
			options: this.summary.options,
			renderedOptions: this.summary.renderedOptions,
			theme: this.theme,
			showTopBorder: isFirst && !shouldBridgeThinkingToTool(this.toolCallId),
			showBottomBorder: isLast && !this.hasAttachedResult,
		}).render();
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
