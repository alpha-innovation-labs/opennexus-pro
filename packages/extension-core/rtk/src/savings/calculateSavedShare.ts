import type { RtkGainPeriod } from "./RtkGainPeriod";

/**
 * Calculates saved tokens as a share of spent plus saved tokens.
 *
 * @param period RTK gain period.
 * @returns Saved percentage in the potential total.
 */
export function calculateSavedShare(period: RtkGainPeriod): number {
	const spent = period.input_tokens + period.output_tokens;
	const potential = spent + period.saved_tokens;
	return potential > 0 ? (period.saved_tokens / potential) * 100 : 0;
}
