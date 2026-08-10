/**
 * Discovers models from a gateway and returns them as-is.
 *
 * Fetches models from the live server, filters out embedding models,
 * and returns every remaining model with sensible defaults for
 * reasoning, cost, contextWindow, and maxTokens.  No catalog lookup.
 */
import type { ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { buildModelsUrl, authHeaders } from "./probe";

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
 * Default model metadata used when no catalog entry is available.
 */
const DEFAULT_MODEL: ProviderConfigInput["models"][number] = {
  id: "",
  name: "",
  reasoning: false,
  input: ["text"] as const,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 128000,
  maxTokens: 8192,
};

/**
 * Fetches models from the gateway and returns them as-is.
 *
 * Embedding models are filtered out.  All remaining models are returned
 * with default metadata — no catalog lookup.
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
      if (isEmbeddingModel(m.id)) {
        continue;
      }
      const entry = { ...DEFAULT_MODEL, id: m.id, name: m.id };
      results.push(entry);
    }
    return results;
  } catch {
    return [];
  }
}
