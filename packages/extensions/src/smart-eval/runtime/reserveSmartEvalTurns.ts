import { createPendingSmartEvalResult } from "./createPendingSmartEvalResult.js";
import { persistSmartEvalTurnResult } from "./persistSmartEvalTurnResult.js";
import type { SmartEvalState, SmartEvalTurn } from "../types.js";

/**
 * Persists pending placeholders for queued evals before background work starts.
 *
 * @param turns Turns queued for background evaluation.
 * @param state Smart-eval state to update.
 * @param paths Persisted state and markdown paths.
 */
export async function reserveSmartEvalTurns(
	turns: SmartEvalTurn[],
	state: SmartEvalState,
	paths: { statePath: string; markdownPath: string },
): Promise<void> {
	for (const turn of turns) await persistSmartEvalTurnResult(turn, createPendingSmartEvalResult(turn), state, paths);
}
