import type { Api, Model } from "@earendil-works/pi-ai";
import { formatContextWindow } from "./formatContextWindow";
import { formatModelCost } from "./formatModelCost";
import { getModelCatalogMetricColumnSpecs } from "./getModelCatalogMetricColumnSpecs";

/**
 * Formats the numeric catalog columns for one model row.
 *
 * @param model Model metadata from Pi's generated registry.
 * @returns Context and per-million-token cost columns.
 */
export function formatModelCatalogMetricsColumns(model: Model<Api>): string {
  const columns = getModelCatalogMetricColumnSpecs();
  return [
    formatContextWindow(model.contextWindow),
    formatModelCost(model.cost.input),
    formatModelCost(model.cost.output),
    formatModelCost(model.cost.cacheRead),
    formatModelCost(model.cost.cacheWrite),
  ].map((value, index) => value.padEnd(columns[index]!.width)).join("  ");
}
