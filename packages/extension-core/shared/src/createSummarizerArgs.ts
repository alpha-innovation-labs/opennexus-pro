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
    "--no-session",
    "--no-context-files",
    "--no-tools",
    "--no-skills",
    "--no-extensions",
    "--enable-features",
    "ai-providers",
    "--disable-features",
    "end-message-formatter",
    "-p",
    prompt,
  ];

  if (model?.provider && model.id) {
    args.unshift(`${model.provider}/${model.id}`);
    args.unshift("--model");
  }

  return args;
}
