import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { ResourceCommandScope } from "./ResourceCommandScope.js";
import { createResourceCommandScopeOptions } from "./createResourceCommandScopeOptions.js";
import { formatResourceCommandScopeTab } from "./formatResourceCommandScopeTab.js";

/**
 * Renders scope tabs for prompt and skill command submenus.
 *
 * @param selectedScope Current scope filter.
 * @param theme Active UI theme.
 * @returns Scope tab line segment.
 */
export function renderResourceCommandScopeTabs(selectedScope: ResourceCommandScope, theme: SharedModalTheme): string {
  return createResourceCommandScopeOptions()
    .map((scope) => formatResourceCommandScopeTab(scope, scope === selectedScope, theme))
    .join(theme.fg("dim", " | "));
}
