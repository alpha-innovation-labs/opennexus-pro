import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit";

export type SystemPromptFramePane = {
	lines: string[];
	width: number;
};

export type SystemPromptFrameHotkey = {
	key: string;
	label: string;
};

/**
 * Renders the system-prompt modal frame without depending on SharedModal class initialization.
 *
 * @param theme Active modal theme.
 * @param width Full terminal width.
 * @param title Header title.
 * @param panes Left and right pane rows.
 * @param hotkeys Footer hotkeys.
 * @returns Framed modal lines.
 */
export function renderSystemPromptModalFrame(
	theme: SelectPreviewTheme,
	width: number,
	title: string,
	panes: readonly [SystemPromptFramePane, SystemPromptFramePane],
	hotkeys: readonly SystemPromptFrameHotkey[],
): string[] {
	const innerWidth = Math.max(1, width - 2);
	const paneRows = renderSystemPromptPaneRows(theme, panes);
	const titleRow = renderSystemPromptFullRow(theme, title, innerWidth);
	const footer = renderSystemPromptFooter(theme, hotkeys, innerWidth);
	return [
		renderSystemPromptBorder(theme, "┌", "─", "┐", innerWidth),
		titleRow,
		renderSystemPromptPaneBorder(theme, "├", "┬", "┤", panes),
		...paneRows,
		renderSystemPromptPaneBorder(theme, "├", "┴", "┤", panes),
		footer,
		renderSystemPromptBorder(theme, "└", "─", "┘", innerWidth),
	];
}

/**
 * Renders all rows in the two-pane body.
 *
 * @param theme Active modal theme.
 * @param panes Left and right pane rows.
 * @returns Framed body rows.
 */
function renderSystemPromptPaneRows(
	theme: SelectPreviewTheme,
	panes: readonly [SystemPromptFramePane, SystemPromptFramePane],
): string[] {
	const rowCount = Math.max(panes[0].lines.length, panes[1].lines.length);
	return Array.from({ length: rowCount }, (_value, index) => {
		const left = padSystemPromptCell(
			panes[0].lines[index] ?? "",
			panes[0].width,
		);
		const right = padSystemPromptCell(
			panes[1].lines[index] ?? "",
			panes[1].width,
		);
		return (
			theme.fg("borderMuted", "│") +
			left +
			theme.fg("borderMuted", "│") +
			right +
			theme.fg("borderMuted", "│")
		);
	});
}

/**
 * Renders one full-width title or footer row.
 *
 * @param theme Active modal theme.
 * @param content Row content.
 * @param width Inner modal width.
 * @returns Framed full-width row.
 */
function renderSystemPromptFullRow(
	theme: SelectPreviewTheme,
	content: string,
	width: number,
): string {
	return (
		theme.fg("borderMuted", "│") +
		padSystemPromptCell(content, width) +
		theme.fg("borderMuted", "│")
	);
}

/**
 * Renders one straight modal border row.
 *
 * @param theme Active modal theme.
 * @param left Left border glyph.
 * @param fill Fill glyph.
 * @param right Right border glyph.
 * @param width Inner modal width.
 * @returns Styled border row.
 */
function renderSystemPromptBorder(
	theme: SelectPreviewTheme,
	left: string,
	fill: string,
	right: string,
	width: number,
): string {
	return theme.fg("borderMuted", `${left}${fill.repeat(width)}${right}`);
}

/**
 * Renders a border row split between the left and right panes.
 *
 * @param theme Active modal theme.
 * @param left Left border glyph.
 * @param separator Pane separator glyph.
 * @param right Right border glyph.
 * @param panes Pane widths.
 * @returns Styled pane border row.
 */
function renderSystemPromptPaneBorder(
	theme: SelectPreviewTheme,
	left: string,
	separator: string,
	right: string,
	panes: readonly [SystemPromptFramePane, SystemPromptFramePane],
): string {
	return theme.fg(
		"borderMuted",
		`${left}${"─".repeat(panes[0].width)}${separator}${"─".repeat(panes[1].width)}${right}`,
	);
}

/**
 * Renders the modal footer hotkeys.
 *
 * @param theme Active modal theme.
 * @param hotkeys Footer hotkeys.
 * @param width Inner modal width.
 * @returns Framed footer row.
 */
function renderSystemPromptFooter(
	theme: SelectPreviewTheme,
	hotkeys: readonly SystemPromptFrameHotkey[],
	width: number,
): string {
	const content = hotkeys
		.map(
			(hotkey) =>
				`${theme.fg("accent", hotkey.key)} ${theme.fg("dim", hotkey.label)}`,
		)
		.join(theme.fg("dim", " · "));
	return renderSystemPromptFullRow(theme, content, width);
}

/**
 * Pads or truncates one ANSI-styled cell to a visible width.
 *
 * @param value Cell content.
 * @param width Target visible width.
 * @returns Width-normalized content.
 */
function padSystemPromptCell(value: string, width: number): string {
	const truncated = truncateToWidth(value, width, "…");
	return truncated + " ".repeat(Math.max(0, width - visibleWidth(truncated)));
}
