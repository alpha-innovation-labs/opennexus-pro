import type { GrepMode } from "@ff-labs/fff-node";

/**
 * Normalizes requested grep mode.
 *
 * @param mode Requested mode.
 * @param literal Requested literal flag.
 * @returns Effective FFF grep mode.
 */
export function normalizeGrepMode(
	mode: string | undefined,
	literal: boolean | undefined,
): GrepMode {
	if (mode === "fuzzy" || mode === "regex" || mode === "plain") {
		return mode;
	}
	return literal === false ? "regex" : "plain";
}
