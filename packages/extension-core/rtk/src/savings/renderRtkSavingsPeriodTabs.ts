import type { SharedModalTheme } from "@nexus/tui-kit";
import { formatRtkSavingsPeriodTab } from "./formatRtkSavingsPeriodTab";
import { getRtkSavingsPeriodLabel } from "./getRtkSavingsPeriodLabel";
import { getRtkSavingsPeriodOptions } from "./getRtkSavingsPeriodOptions";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey";

/**
 * Renders the period selector tabs for the RTK savings modal header.
 *
 * @param selectedPeriod Currently selected period.
 * @param theme Active UI theme.
 * @returns One-line period selector.
 */
export function renderRtkSavingsPeriodTabs(
	selectedPeriod: RtkSavingsPeriodKey,
	theme: SharedModalTheme,
): string {
	return getRtkSavingsPeriodOptions()
		.map((period) =>
			formatRtkSavingsPeriodTab(
				getRtkSavingsPeriodLabel(period),
				period === selectedPeriod,
				theme,
			),
		)
		.join(" │ ");
}
