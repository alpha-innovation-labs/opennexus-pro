import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";
import { getRtkSavingsPeriodOptions } from "./getRtkSavingsPeriodOptions.js";

/**
 * Cycles the selected RTK savings period.
 *
 * @param current Current period key.
 * @param direction Navigation direction.
 * @returns Next period key.
 */
export function getNextRtkSavingsPeriod(current: RtkSavingsPeriodKey, direction: 1 | -1): RtkSavingsPeriodKey {
  const options = getRtkSavingsPeriodOptions();
  const index = options.indexOf(current);
  const nextIndex = (index + direction + options.length) % options.length;
  return options[nextIndex] ?? "daily";
}
