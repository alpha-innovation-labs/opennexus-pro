import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/**
 * Renders a raw-width-safe Tron-style input bubble for embedded modal rows.
 */
export function renderPlainTronBubble(text: string, width: number): string[] {
	const content = `» ${text || " "}`;
	const inner = truncateToWidth(content, Math.max(1, width - 2));
	const innerWidth = Math.max(1, visibleWidth(inner));
	const padded = `${inner}${" ".repeat(Math.max(0, innerWidth - visibleWidth(inner)))}`;
	return [`╭${"─".repeat(innerWidth)}╮`, `│${padded}│`, `╰${"─".repeat(innerWidth)}╯`];
}
