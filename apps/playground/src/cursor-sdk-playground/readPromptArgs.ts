/**
 * Reads the playground prompt from CLI arguments or returns a safe default prompt.
 *
 * @param args Command-line arguments after the script path.
 * @returns Prompt text to send to Cursor SDK.
 */
export function readPromptArgs(args: string[]): string {
  const prompt = args.join(" ").trim();
  return prompt || "Explain this repository in one short paragraph.";
}
