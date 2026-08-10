import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";
import { renderOutlineConnector } from "./renderOutlineConnector";
import { styleSelectedSystemPromptOutlineRow } from "./styleSelectedSystemPromptOutlineRow";
import type { SystemPromptOutlineRow } from "./createSystemPromptOutlineRows";

/**
 * Renders flattened outline rows for the left pane.
 *
 * @param rows Flattened outline rows.
 * @param selectedIndex Selected outline row index.
 * @param focused Whether the outline pane is focused.
 * @param theme Modal theme.
 * @returns Renderable outline lines.
 */
export function renderSystemPromptOutlineRows(rows: readonly SystemPromptOutlineRow[], selectedIndex: number, focused: boolean, theme: SelectPreviewTheme): string[] {
	return rows.map((row, index) => {
		const selected = row.selectable && index === selectedIndex;
		const label = row.level === 0 ? row.label : row.label;
		const text = row.level === 0 ? label : `  ${renderOutlineConnector(row.isLastChild === true)} ${label}`;
		if (!selected) return row.level === 0 ? theme.fg("accent", text) : theme.fg("dim", text);
		return styleSelectedSystemPromptOutlineRow(theme.bold(text));
	});
}
