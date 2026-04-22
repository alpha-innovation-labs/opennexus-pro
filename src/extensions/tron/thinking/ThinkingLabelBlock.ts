import { Container, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { theme } from "../../../pi-internals/theme.js";
import { colorToolCallIcon } from "../colors/colorToolCallIcon.ts";

/**
 * Compact bordered renderer for hidden assistant thinking.
 */
export class ThinkingLabelBlock extends Container {
	constructor(
		private readonly label: string,
		private readonly connectToTools: boolean,
	) {
		super();
	}

	/**
	 * Renders the hidden thinking label.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		const prefixPlain = "󰧑";
		const prefixStyled = colorToolCallIcon(prefixPlain);
		const contentWidth = Math.max(1, innerWidth - visibleWidth(prefixPlain) - 1);
		const body = truncateToWidth(this.label, contentWidth, "…");
		const plainLine = `${prefixPlain} ${body}`;
		const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(plainLine)));
		const lines = [
			theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`),
			`${theme.fg("borderMuted", "│")}${prefixStyled} ${theme.italic(theme.fg("toolOutput", body))}${pad}${theme.fg("borderMuted", "│")}`,
		];
		if (!this.connectToTools) lines.push(theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		return lines;
	}
}
