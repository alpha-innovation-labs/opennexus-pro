import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey";

/**
 * Returns selectable RTK savings period keys in display order.
 *
 * @returns Ordered period keys.
 */
export function getRtkSavingsPeriodOptions(): RtkSavingsPeriodKey[] {
	return ["daily", "weekly", "monthly"];
}
