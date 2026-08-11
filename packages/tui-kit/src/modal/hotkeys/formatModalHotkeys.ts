import type { SharedModalTheme } from "../types";
import { formatModalHotkey } from "./formatModalHotkey";
import type { SharedModalHotkey } from "./types";

/**
 * Formats hotkey hints with purple key text.
 *
 * @param theme Modal theme used to color keys.
 * @param hotkeys Hotkey hints to format.
 * @returns Single display string for the hotkey group.
 */
export function formatModalHotkeys(
	theme: SharedModalTheme,
	hotkeys: readonly SharedModalHotkey[],
): string {
	return hotkeys
		.map((hotkey) => formatModalHotkey(theme, hotkey))
		.join(theme.fg("dim", " · "));
}
