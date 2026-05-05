import { hydrateSmartEvalState } from "../storage/hydrateSmartEvalState.js";
import { writeSmartEvalState } from "../storage/writeSmartEvalState.js";
import type { SmartEvalResult, SmartEvalState, SmartEvalTurn } from "../types.js";

/**
 * Persists one completed smart-eval result while keeping turn order stable.
 *
 * @param turn Evaluated historical turn.
 * @param result Evaluation result.
 * @param state Persisted smart-eval state to update.
 * @param paths Persisted state and markdown paths.
 */
export async function persistSmartEvalTurnResult(
	turn: SmartEvalTurn,
	result: SmartEvalResult,
	state: SmartEvalState,
	paths: { statePath: string; markdownPath: string },
): Promise<void> {
	const turnKey = turn.turnId || String(turn.assistantTimestamp);
	state.turns = state.turns.filter((storedTurn) => (storedTurn.turnId || String(storedTurn.assistantTimestamp)) !== turnKey);
	state.turns.push({ ...turn, index: 0, evaluatedAt: Date.now(), result: { ...result, turnId: turn.turnId, status: result.status ?? "complete" } });
	state.turns.sort((left, right) => left.assistantTimestamp - right.assistantTimestamp);
	state.turns.forEach((storedTurn, index) => {
		storedTurn.index = index + 1;
	});
	hydrateSmartEvalState(state);
	await writeSmartEvalState(paths.statePath, paths.markdownPath, state);
}
