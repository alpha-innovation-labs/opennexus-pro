import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";

/**
 * Adds an inline scrollbar thumb to a pane's visible rows.
 *
 * @param lines Pane lines.
 * @param width Pane width.
 * @param scrollOffset Current pane scroll offset.
 * @param totalRows Total scrollable row count.
 * @param theme Modal theme.
 * @returns Pane lines with a right-edge scrollbar thumb when scrollable.
 */
export function renderPaneScrollbar(lines: readonly string[], width: number, scrollOffset: number, totalRows: number, theme: SelectPreviewTheme): string[] {
	if (totalRows <= lines.length || lines.length === 0) return [...lines];
	const thumbHeight = Math.max(1, Math.floor((lines.length / totalRows) * lines.length));
	const maxScrollOffset = Math.max(1, totalRows - lines.length);
	const thumbTop = Math.round((scrollOffset / maxScrollOffset) * Math.max(0, lines.length - thumbHeight));
	return lines.map((line, index) => replaceLineEnd(line, width, index >= thumbTop && index < thumbTop + thumbHeight ? theme.fg("border", "┃") : theme.fg("borderMuted", "│")));
}

/**
 * Replaces the final visible cell in one line.
 *
 * @param line Line content.
 * @param width Target width.
 * @param marker Replacement marker.
 * @returns Line with marker at the right edge.
 */
function replaceLineEnd(line: string, width: number, marker: string): string {
	const contentWidth = Math.max(1, width - 1);
	const truncated = truncateToWidth(line, contentWidth, "");
	return `${truncated}${" ".repeat(Math.max(0, contentWidth - visibleWidth(truncated)))}${marker}`;
}
