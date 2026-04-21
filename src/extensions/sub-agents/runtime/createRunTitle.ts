/**
 * Normalizes one run title for UI display.
 *
 * @param description Tool description.
 * @param prompt User task prompt.
 * @returns Display title.
 */
export function createRunTitle(description: string, prompt: string): string {
  const baseTitle = prompt.trim() || description.trim() || "Subagent run";
  const compactTitle = baseTitle.replace(/\s+/g, " ").slice(0, 80).trim();
  return `[sub] ${compactTitle}`;
}
