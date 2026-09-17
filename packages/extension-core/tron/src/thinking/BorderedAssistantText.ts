import type { Component, MarkdownTheme } from "@earendil-works/pi-tui";
import { Markdown, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { getMarkdownTheme } from "@earendil-works/pi-coding-agent";
import { theme } from "../theme-proxy";

/**
 * Renders assistant text content inside a border.
 *
 * Border style adapts to context:
 * - Standalone:         ┌───┐ / │...│ / └───┘
 * - Below thinking:     ├───┤ / │...│ / └───┘
 * - Above tool calls:   ┌───┐ / │...│ / ├───┤
 * - Between both:       ├───┤ / │...│ / ├───┤
 *
 * This makes the assistant text visually connect to the thinking block above
 * and the tool call blocks below as one continuous bordered chain.
 */
export class BorderedAssistantText implements Component {
	private cachedWidth: number | undefined;
	private cachedLines: string[] | undefined;
	private readonly markdown: Markdown;

	constructor(
		text: string,
		private readonly connectFromThinking: boolean,
		private readonly connectToTools: boolean,
		markdownTheme?: MarkdownTheme,
		private readonly footerLabel?: string,
	) {
		this.markdown = new Markdown(
			text,
			1,
			0,
			markdownTheme ?? getMarkdownTheme(),
		);
	}

	/**
	 * Renders the bordered assistant text.
	 *
	 * @param width Available width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;

		const innerWidth = Math.max(1, width - 2);
		const contentLines = this.markdown.render(innerWidth);
		const rendered = (contentLines.length > 0 ? contentLines : [""]).map(
			(line) => line.replace(/ +$/, ""),
		);

		const borderChar = theme.fg("borderMuted", "─");
		const bottomLeft = theme.fg("borderMuted", this.connectToTools ? "├" : "└");
		const bottomRight = theme.fg("borderMuted", this.connectToTools ? "┤" : "┘");
		const sideChar = theme.fg("borderMuted", "│");

		// Show the footer (e.g. "⏱ 11s") inline on the bottom border of the box
		// that closes the chain, right-aligned beside the closing corner.
		const footerLabel =
			!this.connectToTools && this.footerLabel ? this.footerLabel : undefined;
		let bottomBorder: string;
		if (footerLabel) {
			const footerSegment = ` ${theme.fg("muted", footerLabel)} `;
			const fillWidth = Math.max(0, innerWidth - visibleWidth(footerSegment));
			bottomBorder = `${bottomLeft}${borderChar.repeat(fillWidth)}${footerSegment}${bottomRight}`;
		} else {
			bottomBorder = `${bottomLeft}${borderChar.repeat(innerWidth)}${bottomRight}`;
		}

		// When this block sits directly under a bordered thinking block, that
		// thinking already draws a ├─┤ bottom wall. Suppress our own top border
		// so the two share a single wall (same as bridged tool calls do).
		const lines: string[] = [];
		if (!this.connectFromThinking) {
			lines.push(
				`${theme.fg("borderMuted", "┌")}${borderChar.repeat(innerWidth)}${theme.fg("borderMuted", "┐")}`,
			);
		}
		for (const line of rendered) {
			const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line)));
			lines.push(`${sideChar}${line}${pad}${sideChar}`);
		}
		lines.push(bottomBorder);

		this.cachedWidth = width;
		this.cachedLines = lines.map((line) => truncateToWidth(line, Math.max(0, width), ""));
		return this.cachedLines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
		this.markdown.invalidate();
	}
}
