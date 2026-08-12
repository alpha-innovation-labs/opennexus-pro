import type { SharedModalTheme } from "@nexus/tui-kit";
import { styleFocusedFooterMode } from "./styleFocusedFooterMode";

/**
 * Creates the resource command menu helper footer line.
 *
 * @param theme Active UI theme.
 * @param detailsFocused Whether the details pane is focused.
 * @returns Footer helper text.
 */
export function createResourceCommandFooterHint(
	theme: SharedModalTheme,
	detailsFocused: boolean,
): string {
	const focus = styleFocusedFooterMode(detailsFocused ? "Detail" : "List");
	const hint = detailsFocused
		? "Tab list · j/k scroll · Ctrl+D/Ctrl+U page"
		: "Tab details";
	return `${focus}${theme.fg("muted", ` · ${hint}`)}`;
}
