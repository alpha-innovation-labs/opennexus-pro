import { getModels, getProviders } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types.js";
import { createModelCatalogLeaf } from "./createModelCatalogLeaf.js";

/**
 * Builds full model catalog leaves from Pi's generated model registry.
 *
 * @returns Sorted full-catalog slash-menu leaves.
 */
export function createModelCatalogLeaves(): SlashMenuLeaf[] {
  return getProviders()
    .flatMap((provider) => getModels(provider).map(createModelCatalogLeaf))
    .sort((left, right) => left.label.localeCompare(right.label));
}
