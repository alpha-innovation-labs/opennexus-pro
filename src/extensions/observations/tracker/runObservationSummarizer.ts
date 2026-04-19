import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

/**
 * Runs a lightweight Pi summarizer prompt and returns its stdout.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param prompt Summarizer prompt.
 * @returns Raw summarizer output.
 */
export async function runObservationSummarizer(
	pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	prompt: string,
): Promise<string> {
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
	if (ctx.model?.provider && ctx.model.id) {
		args.unshift(`${ctx.model.provider}/${ctx.model.id}`);
		args.unshift("--model");
	}
	const { stdout, stderr, code } = await pi.exec("pi", args, { cwd: ctx.cwd });
	if (code !== 0) throw new Error(stderr || stdout || `pi summarizer failed with code ${code}`);
	return stdout;
}
