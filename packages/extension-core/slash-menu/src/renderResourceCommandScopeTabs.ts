import type { SharedModalTheme } from "@nexus/tui-kit";
import { createResourceCommandScopeOptions } from "./createResourceCommandScopeOptions";
import { formatResourceCommandScopeTab } from "./formatResourceCommandScopeTab";
import type { ResourceCommandScope } from "./ResourceCommandScope";

/**
 * Renders scope tabs for prompt and skill command submenus.
 *
 * @param selectedScope Current scope filter.
 * @param theme Active UI theme.
 * @returns Scope tab line segment.
 */
export function renderResourceCommandScopeTabs(
	selectedScope: ResourceCommandScope,
	theme: SharedModalTheme,
): string {
	return createResourceCommandScopeOptions()
		.map((scope) =>
			formatResourceCommandScopeTab(scope, scope === selectedScope, theme),
		)
		.join(theme.fg("dim", " | "));
}
