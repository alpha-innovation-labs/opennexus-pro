/**
 * Extracts a JSON array string from raw LLM output.
 *
 * @param output Raw model output.
 * @returns JSON array text when present.
 */
export function extractJsonArrayText(output: string): string | undefined {
  const trimmed = output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "").trim();
  if (trimmed.startsWith("[")) return trimmed;
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return `[${trimmed}]`;
  }
  const startIndex = trimmed.indexOf("[");
  const endIndex = trimmed.lastIndexOf("]");
  if (startIndex < 0 || endIndex <= startIndex) return undefined;
  return trimmed.slice(startIndex, endIndex + 1);
}
