import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { colorSecondaryText } from "@nexus/extensions/tron/colors/colorSecondaryText.ts";
import { colorToolCallIcon } from "@nexus/extensions/tron/colors/colorToolCallIcon.ts";

/**
 * Renders one tool transcript entry with Tron-style compact tool framing.
 *
 * @param text Tool preview text.
 * @param theme Active Pi theme.
 * @param width Available content width.
 * @returns Rendered tool lines.
 */
export function renderToolEntry(text: string, theme: any, width: number): string[] {
	const innerWidth = Math.max(1, width - 2);
	const iconPlain = "󰘧";
	const labelPlain = "tool";
	const summaryPlain = truncateToWidth(text, Math.max(1, innerWidth - visibleWidth(`${iconPlain} ${labelPlain} `)), "…");
	const contentPlain = `${iconPlain} ${labelPlain} ${summaryPlain}`;
	const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(contentPlain)));
	return [
		theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`),
		`${theme.fg("borderMuted", "│")}${colorToolCallIcon(iconPlain)} ${theme.fg("text", theme.bold(labelPlain))} ${colorSecondaryText(summaryPlain)}${pad}${theme.fg("borderMuted", "│")}`,
		theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`),
	];
}
