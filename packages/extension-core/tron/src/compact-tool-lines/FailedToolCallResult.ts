import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { hasToolCallFrameState } from "../activity/hasToolCallFrameState.ts";
import { shouldShowToolCallBottomBorder } from "../activity/shouldShowToolCallBottomBorder.ts";
import { shouldShowToolCallTopBorder } from "../activity/shouldShowToolCallTopBorder.ts";
import { colorToolCallIcon } from "@extensions/tron/colors/colorToolCallIcon.ts";
import { measureTronRender } from "../profiling/measureTronRender";
import { iconForToolName } from "./iconForToolName.ts";

/**
 * Single-row renderer for failed compact tool calls.
 */
export class FailedToolCallResult {
	constructor(
		private readonly toolCallId: string,
		private readonly toolName: string,
		private readonly errorText: string,
		private readonly theme: any,
	) {}

	/**
	 * Renders one failed tool-call row with regular tool chrome and red error text.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		return measureTronRender("failed-tool-call-result", () => {
			const innerWidth = Math.max(1, width - 2);
			const icon = iconForToolName(this.toolName);
			const prefix = `${icon} ${this.toolName}`;
			const maxErrorWidth = Math.max(0, innerWidth - visibleWidth(prefix) - 1);
			const cleanError = this.errorText.replace(/\s+/g, " ").trim();
			const shownError = maxErrorWidth > 0 ? truncateToWidth(cleanError, maxErrorWidth, "…") : "";
			const contentWidth = visibleWidth(prefix) + (shownError ? 1 + visibleWidth(shownError) : 0);
			const pad = " ".repeat(Math.max(0, innerWidth - contentWidth));
			const hasFrameState = hasToolCallFrameState(this.toolCallId);
			const lines: string[] = [];
			if (hasFrameState ? shouldShowToolCallTopBorder(this.toolCallId) : true) {
				lines.push(this.theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`));
			}
			lines.push(`${this.theme.fg("borderMuted", "│")}${colorToolCallIcon(icon)} ${this.theme.fg("text", this.theme.bold(this.toolName))}${shownError ? ` ${this.theme.fg("error", shownError)}` : ""}${pad}${this.theme.fg("borderMuted", "│")}`);
			if (hasFrameState ? shouldShowToolCallBottomBorder(this.toolCallId) : true) {
				lines.push(this.theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
			}
			return lines;
		}, { width, toolName: this.toolName, errorLength: this.errorText.length });
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
