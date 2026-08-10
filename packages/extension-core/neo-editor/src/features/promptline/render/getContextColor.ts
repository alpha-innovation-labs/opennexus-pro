import { CONTEXT_DANGER_FG, CONTEXT_FG, CONTEXT_OK_FG, CONTEXT_WARN_FG } from "./constants";

/**
 * Picks the context-meter color for the current usage percentage.
 *
 * @param percent Context usage percent.
 * @returns ANSI color sequence.
 */
export function getContextColor(percent: number | undefined | null): string {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return CONTEXT_FG;
  if (percent >= 66.67) return CONTEXT_DANGER_FG;
  if (percent >= 33.33) return CONTEXT_WARN_FG;
  return CONTEXT_OK_FG;
}
