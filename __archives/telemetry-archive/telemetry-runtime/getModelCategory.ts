/**
 * Returns a coarse model category without recording full model identifiers.
 *
 * @param model Model-like event payload value.
 * @returns Model category for analytics.
 */
export function getModelCategory(model: unknown): string {
  if (!model || typeof model !== "object" || !("id" in model)) {
    return "unknown";
  }
  const id = String((model as { id?: unknown }).id ?? "").toLowerCase();
  if (id.includes("opus")) return "claude-opus";
  if (id.includes("sonnet")) return "claude-sonnet";
  if (id.includes("haiku")) return "claude-haiku";
  if (id.includes("gpt")) return "gpt";
  if (id.includes("gemini")) return "gemini";
  if (id.includes("cursor")) return "cursor";
  return "other";
}
