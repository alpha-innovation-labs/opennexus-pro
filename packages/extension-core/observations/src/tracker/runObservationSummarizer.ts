import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { runChild } from "@nexus/runtime/shared/child-process/runChild";

/**
 * Runs a lightweight Nexus summarizer prompt and returns its stdout.
 *
 * @param pi Pi extension API.
 * @param ctx Pi extension context subset.
 * @param prompt Summarizer prompt.
 * @returns Raw summarizer output.
 */
export async function runObservationSummarizer(
	pi: ExtensionAPI,
	ctx: { cwd: string },
	prompt: string,
): Promise<string> {
	return runChild(ctx.cwd, prompt);
}
