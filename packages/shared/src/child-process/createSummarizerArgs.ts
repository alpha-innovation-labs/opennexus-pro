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
    "--disable-features",
    "end-message-formatter",
    "-p",
    prompt,
  ];

  return args;
}
