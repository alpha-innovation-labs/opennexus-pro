import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createSummarizerArgs } from "../summarizer/createSummarizerArgs.js";
import { runBundledObservationSummarizer } from "../summarizer/runBundledObservationSummarizer.js";

/**
 * Runs a lightweight Nexus summarizer prompt and returns its stdout.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param prompt Summarizer prompt.
 * @returns Raw summarizer output.
 */
export async function runObservationSummarizer(
	_pi: ExtensionAPI,
	ctx: { cwd: string; model?: { provider?: string; id?: string } },
	prompt: string,
): Promise<string> {
	const args = createSummarizerArgs(prompt, ctx.model);
	const { stdout, stderr, code } = await runBundledObservationSummarizer(args, ctx.cwd);
	if (code !== 0) return "";
	if (stderr.trim()) return "";
	return stdout;
}
