import { withFileMutationQueue } from "@mariozechner/pi-coding-agent";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SmartEvalState } from "../types.js";
import { renderSmartEvalMarkdown } from "./renderSmartEvalMarkdown.js";
import { updateSmartEvalSummary } from "./updateSmartEvalSummary.js";

/**
 * Persists structured and rendered smart-eval state.
 *
 * @param statePath Smart-eval state path.
 * @param markdownPath Rendered markdown path.
 * @param state Smart-eval state.
 */
export async function writeSmartEvalState(statePath: string, markdownPath: string, state: SmartEvalState): Promise<void> {
	state.updatedAt = Date.now();
	updateSmartEvalSummary(state);
	await mkdir(dirname(statePath), { recursive: true });
	await withFileMutationQueue(statePath, async () => {
		await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
		await writeFile(markdownPath, renderSmartEvalMarkdown(state), "utf8");
	});
}
