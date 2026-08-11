import { visibleWidth } from "@earendil-works/pi-tui";
import { SETTINGS_VALUE_COLUMN } from "./formatSettingsMenuLabel";
import type { SlashMenuLeaf } from "./types";

const SETTINGS_MENU_MIN_WIDTH = 36;
const SETTINGS_MENU_EXTRA_WIDTH = 6;

/**
 * Calculates the compact modal width required by settings rows.
 *
 * @param leaves Settings leaves with current values.
 * @returns Outer modal width that fits labels, aligned values, and borders.
 */
export function calculateSettingsMenuWidth(leaves: SlashMenuLeaf[]): number {
	const widestRow = leaves.reduce((widest, leaf) => {
		const valueWidth = visibleWidth(leaf.currentValue ?? "");
		return Math.max(widest, SETTINGS_VALUE_COLUMN + valueWidth);
	}, visibleWidth("Settings"));
	return Math.max(
		SETTINGS_MENU_MIN_WIDTH,
		widestRow + SETTINGS_MENU_EXTRA_WIDTH,
	);
}
