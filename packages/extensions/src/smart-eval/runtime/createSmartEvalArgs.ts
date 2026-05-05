/**
 * Builds Nexus CLI arguments for one smart-eval subprocess call.
 *
 * @param prompt Evaluation prompt.
 * @param model Active model metadata.
 * @returns CLI argument list.
 */
export function createSmartEvalArgs(prompt: string, model?: { provider?: string; id?: string }): string[] {
	const args = ["--no-extensions", "--no-session", "--no-context-files", "--no-tools", "--thinking", "minimal", "-p", prompt];
	if (model?.provider && model.id) args.unshift("--model", `${model.provider}/${model.id}`);
	return args;
}
