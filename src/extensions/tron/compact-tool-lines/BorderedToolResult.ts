import { visibleWidth } from "@mariozechner/pi-tui";
import { getActivityNeighbors } from "../activity/getActivityNeighbors.ts";
import { toolActivityKey } from "../activity/toolActivityKey.ts";

/**
 * Wraps a built-in tool result component in nexus borders.
 */
export class BorderedToolResult {
	constructor(
		private readonly toolCallId: string,
		private readonly child: { render(width: number): string[]; invalidate?(): void },
		private readonly theme: any,
	) {}

	/**
	 * Renders the bordered result block.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const innerWidth = Math.max(1, width - 2);
		const { isLast } = getActivityNeighbors(toolActivityKey(this.toolCallId));
		const childLines = this.child.render(innerWidth);
		const lines = childLines.map((line) => {
			const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line)));
			return `${this.theme.fg("borderMuted", "│")}${line}${pad}${this.theme.fg("borderMuted", "│")}`;
		});
		if (isLast) {
			lines.push(this.theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
		}
		return lines;
	}

	/**
	 * Forwards invalidation to the child component.
	 */
	invalidate(): void {
		this.child.invalidate?.();
	}
}
