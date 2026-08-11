import type { RtkGainPeriod } from "./RtkGainPeriod";

/**
 * Returns the latest row from an RTK period array.
 *
 * @param periods Period rows.
 * @returns Latest period row, if present.
 */
export function getLatestRtkGainPeriod(
	periods: RtkGainPeriod[] | undefined,
): RtkGainPeriod | undefined {
	return periods?.at(-1);
}
