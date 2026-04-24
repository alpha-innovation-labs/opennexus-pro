/**
 * Adds a selected model reference to an existing scoped-model allow-list.
 *
 * @param enabledModels Persisted scoped model references, or undefined when all models are enabled.
 * @param selectedModel Selected provider-qualified model reference.
 * @returns Updated scoped list, original list, or undefined for all-model scope.
 */
export function ensureEnabledModelIncludesSelection(
  enabledModels: string[] | undefined,
  selectedModel: string,
): string[] | undefined {
  if (!enabledModels) return undefined;
  if (enabledModels.includes(selectedModel)) return enabledModels;
  return [...enabledModels, selectedModel];
}
