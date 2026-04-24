import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
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
	 * Renders one failed tool-call row with muted borders and red content.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		const plain = [iconForToolName(this.toolName), this.toolName, this.errorText].filter(Boolean).join(" ");
		const shown = truncateToWidth(plain.replace(/\s+/g, " ").trim(), innerWidth, "…");
		const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(shown)));
		return [`${this.theme.fg("borderMuted", "│")}${this.theme.fg("error", shown)}${pad}${this.theme.fg("borderMuted", "│")}`];
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
