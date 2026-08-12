import type { SharedModalTheme } from "@nexus/tui-kit";
import type { ResourceCommandScope } from "./ResourceCommandScope";

/**
 * Formats one resource command scope selector tab.
 *
 * @param scope Scope option.
 * @param selected Whether selected.
 * @param theme Active UI theme.
 * @returns Rendered tab.
 */
export function formatResourceCommandScopeTab(
	scope: ResourceCommandScope,
	selected: boolean,
	theme: SharedModalTheme,
): string {
	const label =
		scope === "all"
			? "All [1]"
			: scope === "global"
				? "Global [2]"
				: "Local [3]";
	return selected
		? theme.fg("accent", `● ${label}`)
		: theme.fg("muted", `○ ${label}`);
}
