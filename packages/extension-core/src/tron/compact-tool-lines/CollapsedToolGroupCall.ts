import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { theme } from "../theme-proxy.js";
import { getCollapsedSummaryNeighbors } from "../activity/getCollapsedSummaryNeighbors.ts";
import { getCollapsedToolGroupSummary } from "../activity/getCollapsedToolGroupSummary.ts";
import { colorSecondaryText } from "../colors/colorSecondaryText.ts";
import { colorToolCallIcon } from "../colors/colorToolCallIcon.ts";
import { measureTronRender } from "../profiling/measureTronRender.js";
import { isCompactModeThinkingExpanded } from "../collapse/thinkingVisibility.ts";

const THINKING_ICON = "󰧑";
const TOOL_ICON = "󰘧";
const META_COLUMN_WIDTH = 30;

/**
 * Wraps plain text to a fixed width without dropping words.
 *
 * @param text Input text.
 * @param width Maximum line width.
 * @returns Wrapped plain-text lines.
 */
function wrapPlainText(text: string, width: number): string[] {
	const normalized = text.replace(/\r\n/g, "\n").split("\n");
	const lines: string[] = [];

	for (const rawLine of normalized) {
		const words = rawLine.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) {
			continue;
		}

		let currentLine = "";
		for (const word of words) {
			const nextLine = currentLine ? `${currentLine} ${word}` : word;
			if (visibleWidth(nextLine) <= width) {
				currentLine = nextLine;
				continue;
			}
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
		if (currentLine) lines.push(currentLine);
	}

	return lines.length > 0 ? lines : [""];
}

/**
 * Builds the styled metadata prefix for one collapsed row.
 *
 * @param summary Collapsed summary payload.
 * @returns Styled metadata text.
 */
function renderMeta(summary: ReturnType<typeof getCollapsedToolGroupSummary>): string {
	const baseMeta = [
		colorToolCallIcon(THINKING_ICON),
		colorSecondaryText(" · "),
		colorToolCallIcon(TOOL_ICON),
		colorSecondaryText(` ${summary.toolCallCount}`),
		summary.durationLabel ? `${colorSecondaryText(" · ")}${colorSecondaryText(summary.durationLabel)}` : "",
		summary.addedLineCount === 0 && summary.removedLineCount === 0
			? ""
			: `${colorSecondaryText(" · ")}${theme.fg("syntaxType", `+${summary.addedLineCount}`)} ${theme.fg("error", `-${summary.removedLineCount}`)}`,
	].join("");
	return baseMeta;
}

/**
 * Single-row renderer for a collapsed thinking/tool group inside one shared box.
 */
export class CollapsedToolGroupCall {
	constructor(private readonly toolCallId: string) {}

	/**
	 * Renders one collapsed thinking/tool summary row.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		return measureTronRender("collapsed-tool-group-call", () => {
			const summary = getCollapsedToolGroupSummary(this.toolCallId);
			const neighbors = getCollapsedSummaryNeighbors(summary.leaderToolCallId);
			const innerWidth = Math.max(1, width - 2);
			const metaPlainBase = [
				`${THINKING_ICON} · ${TOOL_ICON} ${summary.toolCallCount}`,
				summary.durationLabel,
				summary.addedLineCount === 0 && summary.removedLineCount === 0 ? "" : `+${summary.addedLineCount} -${summary.removedLineCount}`,
			].filter(Boolean).join(" · ");
			const metaPlain = metaPlainBase;
			const metaColumnWidth = Math.min(META_COLUMN_WIDTH, Math.max(1, innerWidth - 6));
			const shownMetaPlain = truncateToWidth(metaPlain, metaColumnWidth, "…");
			const shownMetaWidth = visibleWidth(shownMetaPlain);
			const contentPrefixPlain = " · ";
			const contentWidth = Math.max(1, innerWidth - metaColumnWidth - visibleWidth(contentPrefixPlain));
			const contentLines = isCompactModeThinkingExpanded()
				? wrapPlainText(summary.fullThinkingText, contentWidth)
				: [truncateToWidth(summary.summaryText, contentWidth, "…")];
			const metaPad = " ".repeat(Math.max(0, metaColumnWidth - shownMetaWidth));
			const renderedMeta = truncateToWidth(renderMeta(summary), metaColumnWidth, "…");
			const lines: string[] = [];
			if (neighbors.isFirst) lines.push(theme.fg("borderMuted", `┌${"─".repeat(innerWidth)}┐`));
			for (const [index, line] of contentLines.entries()) {
				const prefixPlain = index === 0 ? `${shownMetaPlain}${metaPad}${contentPrefixPlain}` : `${" ".repeat(metaColumnWidth)}${contentPrefixPlain}`;
				const contentPlain = truncateToWidth(line, contentWidth, "…");
				const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(prefixPlain) - visibleWidth(contentPlain)));
				const renderedPrefix = index === 0
					? `${renderedMeta}${metaPad}${colorSecondaryText(contentPrefixPlain)}`
					: `${" ".repeat(metaColumnWidth)}${colorSecondaryText(contentPrefixPlain)}`;
				lines.push(`${theme.fg("borderMuted", "│")}${renderedPrefix}${theme.fg("toolOutput", contentPlain)}${pad}${theme.fg("borderMuted", "│")}`);
			}
			if (neighbors.isLast) lines.push(theme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
			return lines;
		}, { width, toolCallId: this.toolCallId });
	}

	/**
	 * No-op invalidator for component compatibility.
	 */
	invalidate(): void {}
}
