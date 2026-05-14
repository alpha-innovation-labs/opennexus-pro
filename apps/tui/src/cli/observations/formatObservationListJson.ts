import type { ObservationListJsonRow } from "./types.js";

/**
 * Formats observation rows as pretty JSON.
 *
 * @param rows Observation rows.
 * @returns JSON string.
 */
export function formatObservationListJson(rows: readonly ObservationListJsonRow[]): string {
  return JSON.stringify(rows, null, 2);
}
