/**
 * Builds CLI arguments for the lightweight summarizer run.
 *
 * @param prompt Summarizer prompt text.
 * @returns CLI argument list.
 */
export function createSummarizerArgs(prompt: string): string[] {
  const args = [
    "--no-session",
    "--minimal",
    "--no-context-files",
    "--no-tools",
    "--thinking",
    "minimal",
    "-p",
    prompt,
  ];

  return args;
}
