import type { RtkGainReport } from "./RtkGainReport.js";
import { isRecord } from "./isRecord.js";
import { isRtkGainPeriod } from "./isRtkGainPeriod.js";
import { isRtkGainSummary } from "./isRtkGainSummary.js";

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
