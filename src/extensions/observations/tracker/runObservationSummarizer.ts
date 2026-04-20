import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isBundledBinary } from "../../../runtime/package/isBundledBinary.js";
import { createSummarizerArgs } from "../summarizer/createSummarizerArgs.js";
import { runBundledObservationSummarizer } from "../summarizer/runBundledObservationSummarizer.js";

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
	const args = createSummarizerArgs(prompt, ctx.model);

	if (isBundledBinary(import.meta.url)) {
		const { stdout, stderr, code } = await runBundledObservationSummarizer(args, ctx.cwd);
		if (code !== 0) return "";
		if (stderr.trim()) return "";
		return stdout;
	}

	const { stdout, stderr, code } = await pi.exec("pi", args, { cwd: ctx.cwd });
	if (code !== 0) return "";
	if (stderr.trim()) return "";
	return stdout;
}
