import { renderCompactLine } from "../compact-line/renderCompactLine.ts";

/**
 * Shared Tron-style compact row renderer for tool-like UI blocks.
 */
export class CompactToolRow {
	constructor(
		private readonly params: {
			width: number;
			icon: string;
			label: string;
			main?: string;
			options?: string;
			renderedOptions?: string;
			theme: { fg(color: string, text: string): string; bold(text: string): string };
			showTopBorder?: boolean;
			showBottomBorder?: boolean;
		},
	) {}

	/**
	 * Renders the compact row.
	 *
	 * @returns Styled row lines.
	 */
	render(): string[] {
		const { width, icon, label, main, options, renderedOptions, theme, showTopBorder = false, showBottomBorder = false } = this.params;
		const innerWidth = Math.max(1, width - 2);
		const lines: string[] = [];
		if (showTopBorder) {
			lines.push(theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`));
		}
		lines.push(
			`${theme.fg("borderMuted", "│")}${renderCompactLine({ width: innerWidth, icon, label, main, options, renderedOptions, theme })}${theme.fg("borderMuted", "│")}`,
		);
		if (showBottomBorder) {
			lines.push(theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		}
		return lines;
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
