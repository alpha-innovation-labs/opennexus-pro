/**
 * Discovers models from a gateway and returns them as-is.
 *
 * Fetches models from the live server, filters out embedding models,
 * and returns every remaining model with sensible defaults for
 * reasoning, cost, contextWindow, and maxTokens.  No catalog lookup.
 */
import { authHeaders, buildModelsUrl } from "./probe";

type ProviderConfigInput = {
	models?: Array<Record<string, unknown>>;
};

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
type ModelEntry = Record<string, unknown>;

const DEFAULT_MODEL: ModelEntry = {
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
 * @param providerId — Optional provider identifier (used for Ollama).
 */
export async function fetchModelsFromGateway(
	baseUrl: string,
	apiKey?: string,
	providerId?: string,
): Promise<NonNullable<ProviderConfigInput["models"]>> {
	try {
		const url =
			providerId === "ollama"
				? `${baseUrl}/api/tags`
				: buildModelsUrl(baseUrl);
		const res = await fetch(url, {
			headers: authHeaders(apiKey),
		});
		if (!res.ok) {
			return [];
		}
		const data = await res.json();
		// OpenAI-compatible gateways: { data: [{ id: string }] }.
		// Ollama: { models: [{ name: string }] }.
		const entries = (data.data ?? data.models ?? []) as Array<{
			id?: string;
			name?: string;
		}>;
		const results: NonNullable<ProviderConfigInput["models"]> = [];
		for (const m of entries) {
			const identifier = m.id ?? m.name;
			if (!identifier || isEmbeddingModel(identifier)) {
				continue;
			}
			const entry = { ...DEFAULT_MODEL, id: identifier, name: identifier };
			results.push(entry);
		}
		return results;
	} catch {
		return [];
	}
}
