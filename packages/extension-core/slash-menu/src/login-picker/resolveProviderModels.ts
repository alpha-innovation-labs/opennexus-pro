import { getBuiltinModels } from "@earendil-works/pi-ai/providers/all";
import type { Model, Api } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types";

/**
 * Resolves model entries for a single provider from the full model catalog.
 *
 * @param providerId Provider id to filter by.
 * @param catalog The full model catalog (from `getBuiltinProviders` + `getBuiltinModels`).
 * @param query Optional query string for filtering model names.
 * @returns Model leaves for the specified provider.
 */
export function resolveProviderModels(
  providerId: string,
  catalog: Array<{ provider: { id: string; name: string }; models: Model<Api>[] }>,
  query?: string,
): SlashMenuLeaf[] {
  const providerEntry = catalog.find((p) => p.provider.id === providerId);
  if (!providerEntry) return [];
  const models = providerEntry.models;
  return models
    .map((model) => ({
      kind: "model" as const,
      label: model.id,
      description: "",
      value: `${providerId}/${model.id}`,
      groupLabel: providerEntry.provider.name,
    }))
    .filter((leaf) => {
      if (!query || query.length === 0) return true;
      const q = query.toLowerCase();
      return (
        leaf.label.toLowerCase().includes(q) ||
        (providerEntry.provider.name?.toLowerCase().includes(q) ?? false)
      );
    });
}
