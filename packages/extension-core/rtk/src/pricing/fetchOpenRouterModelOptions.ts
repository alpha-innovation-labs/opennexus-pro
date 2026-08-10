import type { OpenRouterModelOption } from "./OpenRouterModelOption.js";
/**
 * Fetches priced OpenRouter model options.
 *
 * @param fetcher Fetch implementation override.
 * @returns OpenRouter-priced model options.
 */
export async function fetchOpenRouterModelOptions(fetcher = fetch): Promise<OpenRouterModelOption[]> {
  const response = await fetcher("https://openrouter.ai/api/v1/models");
  const payload = await response.json() as { data?: unknown[] };
  return (payload.data ?? []).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const id = (item as { id?: unknown }).id;
    const name = (item as { name?: unknown }).name;
    const pricing = (item as { pricing?: Record<string, string> }).pricing;
    if (typeof id !== "string" || !pricing) return [];
    return [{
      id,
      label: typeof name === "string" ? name : id,
      pricing: {
        cachedInput: Number(pricing.input_cache_read) || 0,
        input: Number(pricing.prompt) || 0,
        modelId: id,
        output: Number(pricing.completion) || 0,
      },
    }];
  });
}
