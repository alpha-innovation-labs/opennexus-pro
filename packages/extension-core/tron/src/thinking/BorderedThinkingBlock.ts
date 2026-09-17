import type { Component } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { colorToolCallIcon } from "../colors/colorToolCallIcon";
import { theme } from "../theme-proxy";

/** Expanded thinking keeps its Markdown styling inside the Tron activity frame. */
export class BorderedThinkingBlock implements Component {
	constructor(
		private readonly child: Component,
		private readonly connectBelow: boolean,
		private readonly connectFromTool: boolean,
	) {}

	render(width: number): string[] {
		if (width <= 0) return [];
		const innerWidth = Math.max(1, width - 2);
		const border = (text: string) => theme.fg("borderMuted", text);
		const icon = ` ${colorToolCallIcon("󰧑")} `;
		const lines = [
			`${border("┌")}${icon}${border("─".repeat(Math.max(0, innerWidth - visibleWidth(icon))) + "┐")}`,
		];
		// Match the collapsed block's closure of the preceding tool frame.
		if (this.connectFromTool) lines.unshift(border(`└${"─".repeat(innerWidth)}┘`));
		for (const line of this.child.render(innerWidth)) {
			const body = truncateToWidth(line, innerWidth, "");
			const padding = " ".repeat(Math.max(0, innerWidth - visibleWidth(body)));
			lines.push(`${border("│")}${body}${padding}${border("│")}`);
		}
		lines.push(border(this.connectBelow
			? `├${"─".repeat(innerWidth)}┤`
			: `└${"─".repeat(innerWidth)}┘`));
		return lines.map(line => truncateToWidth(line, width, ""));
	}

	invalidate(): void {
		this.child.invalidate();
	}
}
