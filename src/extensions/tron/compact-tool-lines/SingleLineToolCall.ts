import { hasToolCallFrameState } from "../activity/hasToolCallFrameState.ts";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder.ts";
import { shouldShowToolCallTopBorder } from "../activity/shouldShowToolCallTopBorder.ts";
import { CompactToolRow } from "../shared/compact-row/CompactToolRow.ts";
import { measureTronRender } from "../profiling/measureTronRender.js";
import { iconForToolName } from "./iconForToolName.ts";
import type { SummaryText } from "./SummaryText.ts";

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
		const hasFrameState = hasToolCallFrameState(this.toolCallId);
		const showTopBorder = hasFrameState ? shouldShowToolCallTopBorder(this.toolCallId) : true;
		const showBottomBorder = !this.hasAttachedResult && (hasFrameState ? shouldShowToolCallBottomBorder(this.toolCallId) : true);
		const frameKey = `${showTopBorder}:${showBottomBorder}:${this.hasAttachedResult}`;
		if (this.cachedLines && this.cachedWidth === width && this.cachedFrameKey === frameKey) return this.cachedLines;

		const lines = measureTronRender("single-line-tool-call", () => new CompactToolRow({
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
		}).render(), { width, toolName: this.toolName });
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
