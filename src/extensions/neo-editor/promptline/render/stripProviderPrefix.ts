/**
 * Removes the provider prefix from a model id.
 *
 * @param modelId Provider-qualified model id.
 * @returns Provider-free model id.
 */
export function stripProviderPrefix(modelId: string): string {
  return modelId.replace(/^[^/]+\//, "");
}
