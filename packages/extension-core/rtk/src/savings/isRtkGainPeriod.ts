import { isRecord } from "./isRecord";
import type { RtkGainPeriod } from "./RtkGainPeriod";

const REQUIRED_NUMBER_FIELDS = [
	"commands",
	"input_tokens",
	"output_tokens",
	"saved_tokens",
	"savings_pct",
	"total_time_ms",
	"avg_time_ms",
] as const;

/**
 * Checks whether a value is an RTK gain period row.
 *
 * @param value Value to inspect.
 * @returns True when the period row is valid.
 */
export function isRtkGainPeriod(value: unknown): value is RtkGainPeriod {
	return (
		isRecord(value) &&
		REQUIRED_NUMBER_FIELDS.every((field) => typeof value[field] === "number")
	);
}
