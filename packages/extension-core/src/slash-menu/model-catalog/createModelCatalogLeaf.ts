import type { Api, Model } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types.js";
import { createProviderQualifiedModelLabel } from "./createProviderQualifiedModelLabel.js";
import { formatModelCatalogCostColumns } from "./formatModelCatalogCostColumns.js";

const MODEL_CATALOG_LABEL_WIDTH = 52;

/**
 * Creates one full-catalog slash-menu row with input/output pricing columns.
 *
 * @param model Model metadata from Pi's generated registry.
 * @returns Slash-menu leaf for the catalog section.
 */
export function createModelCatalogLeaf(model: Model<Api>): SlashMenuLeaf {
  const reference = createProviderQualifiedModelLabel(model);
  return {
    kind: "model",
    label: reference,
    description: formatModelCatalogCostColumns(model.cost.input, model.cost.output),
    groupLabel: "──────── Full Model Catalog · input/output $/M ────────",
    value: `catalog:${reference}`,
    fixedLabelWidth: MODEL_CATALOG_LABEL_WIDTH,
  };
}
