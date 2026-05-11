import { getModels } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type ProviderConfig = Parameters<ExtensionAPI["registerProvider"]>[1];
type ProviderModelConfig = NonNullable<ProviderConfig["models"]>[number];

/**
 * Creates provider registration model configs from a bundled Pi provider.
 *
 * @param providerId Bundled Pi provider id.
 * @returns Provider models copied from Pi's built-in model registry.
 */
export function createBundledProviderModelConfigs(providerId: string): ProviderModelConfig[] {
  return getModels(providerId as never).map((model) => ({
    id: model.id,
    name: model.name,
    api: model.api,
    reasoning: model.reasoning,
    input: [...model.input],
    cost: { ...model.cost },
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
    headers: model.headers,
    compat: model.compat,
  }));
}
