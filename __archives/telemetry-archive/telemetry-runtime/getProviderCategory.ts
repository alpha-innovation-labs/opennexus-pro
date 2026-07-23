/**
 * Returns a sanitized provider category from a model-like object.
 *
 * @param model Model-like event payload value.
 * @returns Provider category or unknown.
 */
export function getProviderCategory(model: unknown): string {
  if (!model || typeof model !== "object" || !("provider" in model)) {
    return "unknown";
  }
  const provider = (model as { provider?: unknown }).provider;
  return typeof provider === "string" && provider.trim() ? provider.slice(0, 80) : "unknown";
}
