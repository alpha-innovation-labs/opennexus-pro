import { setSmartEvalResult } from "../state/setSmartEvalResult.js";
import type { SmartEvalState } from "../types.js";

/**
 * Copies persisted smart-eval results into the in-memory footer lookup.
 *
 * @param state Persisted smart-eval state.
 */
export function hydrateSmartEvalState(state: SmartEvalState): void {
	for (const turn of state.turns) setSmartEvalResult({ ...turn.result, turnId: turn.turnId });
}
