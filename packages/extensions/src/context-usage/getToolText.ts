/**
 * Builds the measured prompt text for a tool snippet.
 *
 * @param name Tool name.
 * @param snippet Tool snippet text.
 * @returns Text that represents the tool in the system prompt.
 */
export function getToolText(name: string, snippet: string): string {
  return `- ${name}: ${snippet}`;
}
