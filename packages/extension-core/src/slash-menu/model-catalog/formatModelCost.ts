/**
 * Formats one per-million-token model cost for compact table columns.
 *
 * @param cost Cost in US dollars per million tokens.
 * @returns Display cost, or a dash when the model is free/unknown.
 */
export function formatModelCost(cost: number): string {
  if (!Number.isFinite(cost) || cost <= 0) return "$0";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3).replace(/0+$/u, "").replace(/\.$/u, "")}`;
  return `$${cost.toFixed(2).replace(/0+$/u, "").replace(/\.$/u, "")}`;
}
