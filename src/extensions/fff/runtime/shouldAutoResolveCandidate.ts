import type { FffFileCandidate } from "../shared/types.js";
import { scoreTotal } from "./scoreTotal.js";

/**
 * Decides whether the top candidate is strong enough to auto-resolve.
 *
 * @param top Top candidate.
 * @param next Runner-up candidate.
 * @returns True when auto-resolution is safe.
 */
export function shouldAutoResolveCandidate(
  top: FffFileCandidate | undefined,
  next: FffFileCandidate | undefined,
): boolean {
  if (!top) return false;
  if (top.score?.exactMatch || top.score?.matchType === "exact") return true;
  if (!next) return true;
  return scoreTotal(top.score) > scoreTotal(next.score) * 2;
}
