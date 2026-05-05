import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createFailedSmartEvalResult } from "./createFailedSmartEvalResult.js";
import { evaluateSmartEvalTurn } from "./evaluateSmartEvalTurn.js";
import { getSmartEvalConcurrency } from "./getSmartEvalConcurrency.js";
import { persistSmartEvalTurnResult } from "./persistSmartEvalTurnResult.js";
import { runSmartEvalWorkerPool } from "./runSmartEvalWorkerPool.js";
import { startSmartEvalStatusIndicator } from "./startSmartEvalStatusIndicator.js";
import type { SmartEvalState, SmartEvalTurn } from "../types.js";

/**
 * Evaluates missing smart-eval turns asynchronously without blocking session startup.
 *
 * @param turns Missing turns to evaluate.
 * @param state Persisted smart-eval state to append to.
 * @param paths Persisted state and markdown paths.
 * @param ctx Extension context used for cwd and active model.
 * @param statusLabel Status label shown beside the spinner.
 */
export function runMissingSmartEvalsInBackground(
	turns: SmartEvalTurn[],
	state: SmartEvalState,
	paths: { statePath: string; markdownPath: string },
	ctx: Pick<ExtensionContext, "cwd" | "model" | "hasUI" | "ui">,
	statusLabel?: string,
): void {
	void runMissingSmartEvals(turns, state, paths, ctx, statusLabel).catch((error) => {
		console.error("smart-eval background evaluation failed", error);
	});
}

/**
 * Evaluates and persists missing smart-eval turns with bounded parallelism.
 *
 * @param turns Missing turns to evaluate.
 * @param state Persisted smart-eval state to append to.
 * @param paths Persisted state and markdown paths.
 * @param ctx Extension context used for cwd and active model.
 * @param statusLabel Status label shown beside the spinner.
 */
async function runMissingSmartEvals(
	turns: SmartEvalTurn[],
	state: SmartEvalState,
	paths: { statePath: string; markdownPath: string },
	ctx: Pick<ExtensionContext, "cwd" | "model" | "hasUI" | "ui">,
	statusLabel?: string,
): Promise<void> {
	const indicator = startSmartEvalStatusIndicator(ctx, turns.length, statusLabel);
	let completed = 0;
	let persistQueue = Promise.resolve();
	try {
		await runSmartEvalWorkerPool({
			items: turns,
			concurrency: getSmartEvalConcurrency(),
			onItem: async (turn) => {
				const result = await evaluateSmartEvalTurn(turn, ctx).catch(() => undefined) ?? createFailedSmartEvalResult(turn);
				persistQueue = persistQueue.then(() => persistSmartEvalTurnResult(turn, result, state, paths));
				await persistQueue;
				completed += 1;
				indicator.setProgress(completed, turns.length);
			},
		});
		await persistQueue;
	} finally {
		indicator.stop();
	}
}
