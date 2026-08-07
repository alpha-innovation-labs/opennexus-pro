/**
 * Discovers models from a gateway and maps them to Pi's model format.
 *
 * Fetches models from the live server, filters out embedding models,
 * looks up each model in the built-in catalog, and returns them in
 * Pi's model format (id, name, reasoning, input, cost, contextWindow,
 * maxTokens).  Models with no catalog entry are silently skipped.
 */
import type { ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { getBuiltinModels, getBuiltinProviders } from "@earendil-works/pi-ai/providers/all";
import { buildModelsUrl, authHeaders } from "./probe.js";

/**
 * Returns true if a model ID looks like an embedding model.
 *
 * Matches IDs containing: embed, text-embedding, clip, bge, mxbai, nomic-embed.
 */
export function isEmbeddingModel(id: string): boolean {
  const lower = id.toLowerCase();
  return (
    lower.includes("embed") ||
    lower.includes("text-embedding") ||
    lower.includes("clip") ||
    lower.includes("bge") ||
    lower.includes("mxbai") ||
    lower.includes("nomic-embed")
  );
}

/**
 * Looks up a model ID across all built-in providers in the pi-ai catalog.
 *
 * @param modelId — The model identifier to search for.
 * @returns The catalog metadata if found, or `undefined` when no catalog
 *   entry exists.  Callers MUST NOT fabricate a value in that case —
 *   hardcoding is a CATASTROPHIC FAILURE.
 */
export function lookupCatalogModel(modelId: string): {
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: ProviderConfigInput["models"][number]["cost"];
  contextWindow: number;
  maxTokens: number;
} | undefined {
  for (const provider of getBuiltinProviders()) {
    const models = getBuiltinModels(provider);
    const match = models.find((m) => m.id === modelId);
    if (match) {
      return {
        reasoning: match.reasoning,
        input: match.input,
        cost: match.cost,
        contextWindow: match.contextWindow,
        maxTokens: match.maxTokens,
      };
    }
  }
  return undefined;
}

/**
 * Fetches models from the gateway and maps them to Pi's model format.
 *
 * Embedding models are filtered out.  For each model ID returned by the
 * gateway, the built-in model catalog is consulted — `reasoning`,
 * `input`, `cost`, `contextWindow`, and `maxTokens` are all sourced from
 * the catalog.  Models with no catalog entry are silently skipped.
 *
 * Returns an empty array if the gateway is unreachable.
 *
 * @param baseUrl — The base URL of the inference server.
 * @param apiKey — Optional API key for authentication.
 */
export async function fetchModelsFromGateway(
  baseUrl: string,
  apiKey?: string,
): Promise<NonNullable<ProviderConfigInput["models"]>> {
  try {
    const url = buildModelsUrl(baseUrl);
    const res = await fetch(url, {
      headers: authHeaders(apiKey),
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const catalogModels = data.data ?? [];
    const results: NonNullable<ProviderConfigInput["models"]> = [];
    for (const m of catalogModels as Array<{ id: string }>) {
      // Skip embedding models — they are not LLMs.
      if (isEmbeddingModel(m.id)) {
        continue;
      }
      const catalog = lookupCatalogModel(m.id);
      if (!catalog) {
        // NOTE: Hardcoding reasoning, input, cost, contextWindow, or maxTokens
        // when no catalog entry exists is a CATASTROPHIC FAILURE.  Always add
        // the model to the pi-ai catalog (models.generated.ts) before using it
        // through a gateway, so the real values flow through here.
        continue;
      }
      results.push({
        id: m.id,
        name: m.id,
        reasoning: catalog.reasoning,
        input: catalog.input,
        cost: catalog.cost,
        contextWindow: catalog.contextWindow,
        maxTokens: catalog.maxTokens,
      });
    }
    return results;
  } catch {
    return [];
  }
}
