import type { TokenUsageTotals } from "./TokenUsageTotals";

/**
 * Adds one token usage total into another in place.
 *
 * @param target Total to mutate.
 * @param source Total to add.
 */
export function addTokenUsageTotals(
	target: TokenUsageTotals,
	source: TokenUsageTotals,
): void {
	target.cacheRead += source.cacheRead;
	target.cacheWrite += source.cacheWrite;
	target.input += source.input;
	target.output += source.output;
	target.total += source.total;
}
