import { hasToolCallFrameState } from "../activity/hasToolCallFrameState";
import { shouldBridgeThinkingToTool } from "../activity/shouldBridgeThinkingToTool";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder";
import { shouldShowToolCallTopBorder } from "../activity/shouldShowToolCallTopBorder";
import { measureTronRender } from "../profiling/measureTronRender";
import { CompactToolRow } from "../shared/compact-row/CompactToolRow";
import { iconForToolName } from "./iconForToolName";
import type { SummaryText } from "./SummaryText";

/**
 * Single-row compact tool-call renderer.
 */
export class SingleLineToolCall {
	private cachedWidth: number | undefined;
	private cachedFrameKey: string | undefined;
	private cachedLines: string[] | undefined;

	constructor(
		private readonly toolCallId: string,
		private readonly toolName: string,
		private readonly summary: SummaryText,
		private readonly theme: unknown,
		private readonly hasAttachedResult: boolean,
	) {}

	/**
	 * Renders one compact tool-call block.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const hasFrameState = hasToolCallFrameState(this.toolCallId);
		const showTopBorder = shouldBridgeThinkingToTool(this.toolCallId)
			? false
			: hasFrameState
				? shouldShowToolCallTopBorder(this.toolCallId)
				: true;
		const showBottomBorder =
			!this.hasAttachedResult &&
			(hasFrameState ? shouldShowToolCallBottomBorder(this.toolCallId) : true);
		const frameKey = `${showTopBorder}:${showBottomBorder}:${this.hasAttachedResult}`;
		if (
			this.cachedLines &&
			this.cachedWidth === width &&
			this.cachedFrameKey === frameKey
		)
			return this.cachedLines;

		const lines = measureTronRender(
			"single-line-tool-call",
			() =>
				new CompactToolRow({
					width,
					icon: iconForToolName(this.toolName),
					label: this.toolName,
					main: this.summary.main,
					inlineStats: this.summary.inlineStats,
					renderedInlineStats: this.summary.renderedInlineStats,
					options: this.summary.options,
					renderedOptions: this.summary.renderedOptions,
					theme: this.theme,
					showTopBorder,
					showBottomBorder,
				}).render(),
			{ width, toolName: this.toolName },
		);
		this.cachedWidth = width;
		this.cachedFrameKey = frameKey;
		this.cachedLines = lines;
		return lines;
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
