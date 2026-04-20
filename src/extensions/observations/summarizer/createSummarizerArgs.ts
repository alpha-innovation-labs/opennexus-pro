/**
 * Builds CLI arguments for the lightweight observations summarizer run.
 *
 * @param prompt Summarizer prompt text.
 * @param model Active model metadata.
 * @returns CLI argument list.
 */
export function createSummarizerArgs(
  prompt: string,
  model?: { provider?: string; id?: string },
): string[] {
  const args = [
    "--no-extensions",
    "--no-session",
    "--no-context-files",
    "--no-tools",
    "--thinking",
    "minimal",
    "-p",
    prompt,
  ];

  if (model?.provider && model.id) {
    args.unshift(`${model.provider}/${model.id}`);
    args.unshift("--model");
  }

  return args;
}
