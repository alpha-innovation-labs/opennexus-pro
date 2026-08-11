import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey";
import { renderRtkSavingsPeriodTabs } from "./renderRtkSavingsPeriodTabs";

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
