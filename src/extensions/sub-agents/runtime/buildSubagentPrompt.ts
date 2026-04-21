/**
 * Builds the final prompt sent to the child subagent.
 *
 * @param contextBlock Optional inherited/custom context.
 * @param prompt Requested task prompt.
 * @returns Final prompt string.
 */
export function buildSubagentPrompt(contextBlock: string, prompt: string): string {
  if (!contextBlock.trim()) return prompt;
  return `${contextBlock}\n\n---\n\n# Your Task\n\n${prompt}`;
}
