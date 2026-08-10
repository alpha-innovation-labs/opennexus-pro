import type { AutocompleteProvider } from "@earendil-works/pi-tui";
import { loadFeatureState } from "../features/loadFeatureState.js";
import { getRuntimeForCwd } from "../runtime/runtimeStore.js";
import { createFffAutocompleteProvider } from "./createFffAutocompleteProvider.js";

/**
 * Wraps a Neo editor autocomplete provider with FFF support when enabled.
 *
 * @param cwd Session cwd.
 * @param provider Existing provider.
 * @returns Provider with optional FFF wrapping.
 */
export async function wrapAutocompleteProviderForCwd(
  cwd: string,
  provider: AutocompleteProvider,
): Promise<AutocompleteProvider> {
  const enabledFeatures = await loadFeatureState();
  if (!enabledFeatures.has("editorAutocomplete")) return provider;
  const runtime = getRuntimeForCwd(cwd);
  return runtime ? createFffAutocompleteProvider(provider, runtime) : provider;
}
