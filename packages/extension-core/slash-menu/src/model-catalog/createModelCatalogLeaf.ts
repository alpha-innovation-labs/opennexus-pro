import type { Api, Model } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types";
import { createProviderQualifiedModelLabel } from "./createProviderQualifiedModelLabel";
import { formatModelCatalogMetricsColumns } from "./formatModelCatalogMetricsColumns";
import { getModelCatalogColumnHeaderText } from "./getModelCatalogColumnHeaderText";

const MODEL_CATALOG_LABEL_WIDTH = 34;

/**
 * Creates one full-catalog slash-menu row with metric columns.
 *
 * @param model Model metadata from Pi's generated registry.
 * @returns Slash-menu leaf for the catalog section.
 */
export function createModelCatalogLeaf(model: Model<Api>): SlashMenuLeaf {
  const reference = createProviderQualifiedModelLabel(model);
  return {
    kind: "model",
    label: model.name,
    description: formatModelCatalogMetricsColumns(model),
    groupLabel: model.provider,
    groupHeaderDescription: getModelCatalogColumnHeaderText(),
    value: `catalog:${reference}`,
    fixedLabelWidth: MODEL_CATALOG_LABEL_WIDTH,
  };
}
