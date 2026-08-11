import type { Score } from "@ff-labs/fff-node";

/**
 * Returns a sortable numeric total for an FFF score.
 *
 * @param score Candidate score.
 * @returns Score total.
 */
export function scoreTotal(score: Score | undefined): number {
	return score?.total ?? Number.NEGATIVE_INFINITY;
}
