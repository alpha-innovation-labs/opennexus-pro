/**
 * Normalizes queue input and rejects empty prompt text.
 *
 * @param text Candidate prompt text.
 * @returns Trimmed prompt text, or undefined when empty.
 */
export function sanitizePromptQueueText(text: string): string | undefined {
  const normalized = text.trim();
  return normalized.length > 0 ? normalized : undefined;
}
