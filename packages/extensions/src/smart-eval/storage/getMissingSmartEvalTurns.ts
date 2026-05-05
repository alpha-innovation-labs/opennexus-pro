import type { SmartEvalState, SmartEvalTurn } from "../types.js";

/**
 * Filters historical turns down to those without persisted eval results.
 *
 * @param turns Historical turns from the current branch.
 * @param state Persisted smart-eval state.
 * @returns Turns that still need evaluation.
 */
export function getMissingSmartEvalTurns(turns: SmartEvalTurn[], state: SmartEvalState): SmartEvalTurn[] {
	const evaluatedKeys = new Set(state.turns.map((turn) => turn.turnId || String(turn.assistantTimestamp)));
	return turns.filter((turn) => !evaluatedKeys.has(turn.turnId || String(turn.assistantTimestamp)));
}
