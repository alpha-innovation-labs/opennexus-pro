import type { FileItem, Score } from "@ff-labs/fff-node";
import type { FffFileCandidate } from "../shared/types.js";

/**
 * Converts an FFF engine item into the local candidate shape.
 *
 * @param item Engine item.
 * @param score Engine score.
 * @returns Local candidate.
 */
export function normalizeCandidate(item: FileItem, score: Score | undefined): FffFileCandidate {
  return { item, score };
}
