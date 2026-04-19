import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Renders one 50/50 pane column inside the playground modal.
 *
 * @param pane Render-ready pane data.
 * @param theme Active Pi theme.
 * @param width Available pane width.
 * @param bodyHeight Transcript body height.
 * @param scrollOffset Shared scroll offset.
 * @returns Pane column lines.
 */
export function renderPaneColumn(
	pane: { title: string; status: string; busy: boolean; lines: string[] },
	theme: any,
	width: number,
	bodyHeight: number,
	scrollOffset: number,
): string[] {
	const maxScroll = Math.max(0, pane.lines.length - bodyHeight);
	const start = Math.max(0, pane.lines.length - bodyHeight - Math.min(scrollOffset, maxScroll));
	const visible = pane.lines.slice(start, start + bodyHeight);
	while (visible.length < bodyHeight) visible.push("");
	const headerText = `${theme.fg("accent", theme.bold(pane.title))} ${theme.fg(pane.busy ? "warning" : "success", `[${pane.status}]`)}`;
	const shownHeader = truncateToWidth(headerText, width, "…");
	const header = shownHeader + " ".repeat(Math.max(0, width - visibleWidth(shownHeader)));
	const rule = theme.fg("borderMuted", "─".repeat(width));
	return [header, rule, ...visible.map((line) => {
		const shown = truncateToWidth(line, width, "");
		return shown + " ".repeat(Math.max(0, width - visibleWidth(shown)));
	})];
}
