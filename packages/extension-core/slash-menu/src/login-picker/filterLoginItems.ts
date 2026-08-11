import type { SlashMenuLeaf, SlashMenuSection } from "../types";
import { filterMenuItems } from "../filterMenuItems";

/**
 * Two-pass filter for login-picker: first filters providers, then for each
 * visible provider, filters its models.
 *
 * If a model appears under multiple providers, it appears under each matching
 * provider. Providers with zero matching models after filtering are hidden.
 *
 * @param allProviders All provider leaves (left pane).
 * @param allModelsByProvider Map of providerId → model leaves.
 * @param query Current search query.
 * @returns Filtered provider leaves and a map of filtered model leaves per provider.
 */
export function filterLoginItems(
  allProviders: Array<SlashMenuLeaf | SlashMenuSection>,
  allModelsByProvider: Map<string, SlashMenuLeaf[]>,
  query: string,
): { filteredProviders: Array<SlashMenuLeaf | SlashMenuSection>; filteredModelsByProvider: Map<string, SlashMenuLeaf[]> } {
  const tokens = query.toLowerCase().trim();

  // Two-pass filter: first filter providers, then for each visible provider, filter its models.
  // If a model appears under multiple providers, it appears under each matching provider.
  // Providers with zero matching models after filtering are hidden from the left pane.
  const filtered = new Map<string, SlashMenuLeaf[]>();
  const filteredProviders: Array<SlashMenuLeaf | SlashMenuSection> = [];

  for (const provider of allProviders) {
    const providerModels = allModelsByProvider.get(provider.value) ?? [];
    const filteredModels = filterMenuItems(providerModels as Array<SlashMenuLeaf | SlashMenuSection>, query);
    const leafOnly = filteredModels.filter((item): item is SlashMenuLeaf => "kind" in item);
    if (leafOnly.length > 0) {
      filtered.set(provider.value, leafOnly);
      filteredProviders.push(provider);
    }
  }

  return { filteredProviders, filteredModelsByProvider: filtered };
}
