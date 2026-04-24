import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { colorToolCallIcon } from "../colors/colorToolCallIcon.ts";
import { iconForToolName } from "./iconForToolName.ts";

/**
 * Single-row renderer for failed compact tool calls.
 */
export class FailedToolCallResult {
	constructor(
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
		const innerWidth = Math.max(1, width - 2);
		const icon = iconForToolName(this.toolName);
		const prefix = `${icon} ${this.toolName}`;
		const maxErrorWidth = Math.max(0, innerWidth - visibleWidth(prefix) - 1);
		const cleanError = this.errorText.replace(/\s+/g, " ").trim();
		const shownError = maxErrorWidth > 0 ? truncateToWidth(cleanError, maxErrorWidth, "…") : "";
		const contentWidth = visibleWidth(prefix) + (shownError ? 1 + visibleWidth(shownError) : 0);
		const pad = " ".repeat(Math.max(0, innerWidth - contentWidth));
		return [
			`${this.theme.fg("borderMuted", "│")}${colorToolCallIcon(icon)} ${this.theme.fg("text", this.theme.bold(this.toolName))}${shownError ? ` ${this.theme.fg("error", shownError)}` : ""}${pad}${this.theme.fg("borderMuted", "│")}`,
		];
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
