import type { Api, Model } from "@earendil-works/pi-ai";
import { formatContextWindow } from "./formatContextWindow.js";
import { formatModelCost } from "./formatModelCost.js";

/**
 * Formats the numeric catalog columns for one model row.
 *
 * @param model Model metadata from Pi's generated registry.
 * @returns Context and per-million-token cost columns.
 */
export function formatModelCatalogMetricsColumns(model: Model<Api>): string {
  return [
    formatContextWindow(model.contextWindow).padStart(10),
    formatModelCost(model.cost.input).padStart(10),
    formatModelCost(model.cost.output).padStart(11),
    formatModelCost(model.cost.cacheRead).padStart(13),
    formatModelCost(model.cost.cacheWrite).padStart(14),
  ].join("  ");
}
