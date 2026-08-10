import type { RtkGainPeriod } from "./RtkGainPeriod";
import type { RtkGainReport } from "./RtkGainReport";
import { isRecord } from "./isRecord";
import { isRtkGainPeriod } from "./isRtkGainPeriod";
import { isRtkGainSummary } from "./isRtkGainSummary";

/**
 * Parses the `rtk gain --format json` output used by Nexus savings.
 *
 * @param jsonText Raw RTK JSON stdout.
 * @returns Parsed RTK gain report.
 */
export function parseRtkGainJson(jsonText: string): RtkGainReport {
  const parsed = JSON.parse(jsonText) as unknown;
  if (!isRecord(parsed) || !isRtkGainSummary(parsed.summary)) {
    throw new Error("RTK gain JSON did not include a valid summary.");
  }

  return {
    daily: parseOptionalPeriods(parsed.daily),
    monthly: parseOptionalPeriods(parsed.monthly),
    summary: parsed.summary,
    weekly: parseOptionalPeriods(parsed.weekly),
  };
}

/**
 * Parses an optional RTK period array.
 *
 * @param value Unknown optional period value.
 * @returns Valid period rows, or undefined when absent.
 */
function parseOptionalPeriods(value: unknown): RtkGainPeriod[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every(isRtkGainPeriod)) {
    throw new Error("RTK gain JSON included invalid period rows.");
  }
  return value;
}
