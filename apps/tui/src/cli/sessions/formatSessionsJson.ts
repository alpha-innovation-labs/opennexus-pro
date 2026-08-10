import type { SessionJsonRow } from "./SessionJsonRow";

/**
 * Formats session rows as pretty JSON for machine-readable CLI output.
 *
 * @param rows JSON-safe session rows.
 * @returns Pretty-printed JSON array.
 */
export function formatSessionsJson(rows: readonly SessionJsonRow[]): string {
  return JSON.stringify(rows, undefined, 2);
}
