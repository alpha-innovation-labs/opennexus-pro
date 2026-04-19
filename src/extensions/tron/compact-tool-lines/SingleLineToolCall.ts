import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { getActivityNeighbors } from "../activity/getActivityNeighbors.ts";
import { shouldBridgeThinkingToTool } from "../activity/shouldBridgeThinkingToTool.ts";
import { toolActivityKey } from "../activity/toolActivityKey.ts";
import { colorPrimaryText } from "../colors/colorPrimaryText.ts";
import { colorSecondaryText } from "../colors/colorSecondaryText.ts";
import { colorToolCallIcon } from "../colors/colorToolCallIcon.ts";
import { iconForToolName } from "./iconForToolName.ts";

/**
 * Single-row compact tool-call renderer.
 */
export class SingleLineToolCall {
	constructor(
		private readonly toolCallId: string,
		private readonly toolName: string,
		private readonly summary: { main: string; options: string },
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
		const icon = iconForToolName(this.toolName);
		const maxBodyWidth = Math.max(1, width - 2);
		const leftPrefixPlain = `${icon} ${this.toolName}`;
		const leftPrefixWidth = visibleWidth(leftPrefixPlain);
		const rawMain = this.summary.main || "";
		const rawOptions = this.summary.options || "";
		const maxOptionsWidth = rawOptions ? Math.max(0, maxBodyWidth - leftPrefixWidth - 1) : 0;
		const shownOptions = rawOptions ? truncateToWidth(rawOptions, maxOptionsWidth, "…") : "";
		const optionsWidth = visibleWidth(shownOptions);
		const optionsGap = shownOptions ? 1 : 0;
		const maxMainWidth = rawMain ? Math.max(0, maxBodyWidth - leftPrefixWidth - optionsGap - optionsWidth - 1) : 0;
		const shownMain = rawMain ? truncateToWidth(rawMain, maxMainWidth, "…") : "";
		const leftPlain = [leftPrefixPlain, shownMain].filter(Boolean).join(" ");
		const leftWidth = visibleWidth(leftPlain);
		const gapWidth = Math.max(0, maxBodyWidth - leftWidth - optionsGap - optionsWidth);
		const padWidth = Math.max(0, maxBodyWidth - leftWidth - gapWidth - optionsGap - optionsWidth);
		const leftStyled = [
			colorToolCallIcon(icon),
			this.theme.fg("text", this.theme.bold(this.toolName)),
			shownMain ? colorSecondaryText(shownMain) : "",
		].filter(Boolean).join(" ");
		const rightStyled = shownOptions ? this.theme.fg("dim", shownOptions) : "";
		const content =
			this.theme.fg("borderMuted", "│") +
			leftStyled +
			" ".repeat(gapWidth) +
			(shownOptions ? ` ${rightStyled}` : "") +
			" ".repeat(padWidth) +
			this.theme.fg("borderMuted", "│");
		const { isFirst, isLast } = getActivityNeighbors(toolActivityKey(this.toolCallId));
		const lines: string[] = [];
		if (isFirst && !shouldBridgeThinkingToTool(this.toolCallId)) {
			lines.push(this.theme.fg("borderMuted", `┌${"─".repeat(maxBodyWidth)}┐`));
		}
		lines.push(content);
		if (isLast && !this.hasAttachedResult) {
			lines.push(this.theme.fg("borderMuted", `└${"─".repeat(maxBodyWidth)}┘`));
		}
		return lines;
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
