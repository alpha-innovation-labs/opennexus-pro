import type { ContextUsageRuntimeSnapshot } from "./types.js";

/**
 * Normalizes Pi context usage values and ignores impossible snapshots.
 *
 * @param usage Raw Pi context usage.
 * @param modelContextWindow Active model context window.
 * @returns Normalized context usage.
 */
export function normalizeContextUsage(
  usage: ContextUsageRuntimeSnapshot["usage"],
  modelContextWindow: number,
): ContextUsageRuntimeSnapshot["usage"] {
  const contextWindow = Math.max(modelContextWindow, usage?.contextWindow ?? 0);
  if (contextWindow <= 0) return null;
  if (usage?.tokens !== null && usage?.tokens !== undefined && usage.tokens > 0 && usage.contextWindow >= contextWindow) return usage;
  return { tokens: null, contextWindow, percent: null };
}
