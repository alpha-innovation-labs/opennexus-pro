/**
 * Builds CLI arguments for the lightweight summarizer run.
 *
 * @param prompt Summarizer prompt text.
 * @returns CLI argument list.
 */
export function createSummarizerArgs(prompt: string): string[] {
  const args = [
    "--no-session",
    "--no-context-files",
    "--no-tools",
    "--no-skills",
    "--no-extensions",
    "--enable-features",
    "ai-providers",
    "-p",
    prompt,
  ];

  return args;
}
