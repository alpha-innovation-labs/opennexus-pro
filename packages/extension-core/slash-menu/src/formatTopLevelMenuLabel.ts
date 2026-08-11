import { visibleWidth } from "@earendil-works/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";

export const TOP_LEVEL_DESCRIPTION_COLUMN = 28;

/**
 * Formats one top-level menu row with a fixed description column.
 *
 * @param label Visible command label.
 * @param description Command description.
 * @param theme Active UI theme.
 * @param icon Leading row icon.
 * @returns Formatted row label.
 */
export function formatTopLevelMenuLabel(
	label: string,
	description: string | undefined,
	theme: SelectPreviewTheme,
	icon = "",
): string {
	const labelText = icon ? `${icon} ${label}` : label;
	const visibleLabelWidth = visibleWidth(labelText);
	const spacing = " ".repeat(
		Math.max(2, TOP_LEVEL_DESCRIPTION_COLUMN - visibleLabelWidth),
	);
	return `${labelText}${spacing}${theme.fg("muted", description ?? "")}`;
}
