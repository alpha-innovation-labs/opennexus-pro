import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";
import { renderRtkSavingsPeriodTabs } from "./renderRtkSavingsPeriodTabs.js";

/**
 * Creates the RTK savings modal header with title left and selector right.
 *
 * @param theme Active UI theme.
 * @param selectedPeriod Currently selected period.
 * @param width Available inner modal width.
 * @returns Header line.
 */
export function createRtkSavingsHeaderLine(
  theme: SharedModalTheme,
  selectedPeriod: RtkSavingsPeriodKey,
  width: number,
): string {
  const title = theme.fg("accent", "Token Savings");
  const tabs = renderRtkSavingsPeriodTabs(selectedPeriod, theme);
  const gap = width - visibleWidth(title) - visibleWidth(tabs);
  if (gap >= 1) return `${title}${" ".repeat(gap)}${tabs}`;
  return truncateToWidth(`${title} ${tabs}`, width);
}
