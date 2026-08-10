import type { RtkGainSummary } from "./RtkGainSummary";
import { isRecord } from "./isRecord";

const REQUIRED_NUMBER_FIELDS = [
  "total_commands",
  "total_input",
  "total_output",
  "total_saved",
  "avg_savings_pct",
  "total_time_ms",
  "avg_time_ms",
] as const;

/**
 * Checks whether a value is an RTK gain summary.
 *
 * @param value Value to inspect.
 * @returns True when all summary fields are numeric.
 */
export function isRtkGainSummary(value: unknown): value is RtkGainSummary {
  return isRecord(value) && REQUIRED_NUMBER_FIELDS.every((field) => typeof value[field] === "number");
}
