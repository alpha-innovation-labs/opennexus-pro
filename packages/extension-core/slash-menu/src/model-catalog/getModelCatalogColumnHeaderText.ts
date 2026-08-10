import { getModelCatalogMetricColumnSpecs } from "./getModelCatalogMetricColumnSpecs";

/**
 * Gets the All models metric column header text.
 *
 * @returns Catalog column header text.
 */
export function getModelCatalogColumnHeaderText(): string {
  return getModelCatalogMetricColumnSpecs()
    .map((column) => column.label.padEnd(column.width))
    .join("  ");
}
