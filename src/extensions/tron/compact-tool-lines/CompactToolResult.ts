import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { getResultText } from "./getResultText.ts";

/**
 * Compact text-only tool result renderer.
 */
export class CompactToolResult {
	constructor(
		private readonly result: any,
		private readonly expanded: boolean,
		private readonly theme: any,
	) {}

	/**
	 * Renders the compact tool result.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		if (!this.expanded) return [];
		const text = getResultText(this.result);
		if (!text) return [];
		const innerWidth = Math.max(1, width - 2);
		const lines = text.split("\n").map((line) => {
			const clean = line.replace(/\t/g, "    ");
			const truncated = truncateToWidth(clean, innerWidth, "…");
			const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(truncated)));
			return `${this.theme.fg("borderMuted", "│")}${this.theme.fg("toolOutput", truncated)}${pad}${this.theme.fg("borderMuted", "│")}`;
		});
		lines.push(this.theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		return lines;
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
