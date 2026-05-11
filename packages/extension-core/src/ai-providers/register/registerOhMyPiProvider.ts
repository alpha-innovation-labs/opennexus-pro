import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AiProviderDefinition } from "../model/AiProviderDefinition.js";
import { createBundledProviderModelConfigs } from "../model/createBundledProviderModelConfigs.js";
import { getBundledModelProviderAlias } from "../model/getBundledModelProviderAlias.js";
import { getBundledProviderBaseUrl } from "../model/getBundledProviderBaseUrl.js";
import { createManualOAuthProvider } from "../oauth/createManualOAuthProvider.js";

/**
 * Registers one oh-my-pi provider entry with Pi's provider registry.
 *
 * @param pi Pi extension API.
 * @param definition Provider metadata.
 */
export function registerOhMyPiProvider(pi: ExtensionAPI, definition: AiProviderDefinition): void {
  const bundledProviderId = getBundledModelProviderAlias(definition.id);
  const models = bundledProviderId ? createBundledProviderModelConfigs(bundledProviderId) : undefined;
  const baseUrl = bundledProviderId ? getBundledProviderBaseUrl(bundledProviderId) : undefined;
  pi.registerProvider(definition.id, {
    baseUrl,
    models,
    oauth: createManualOAuthProvider(definition),
  });
}
