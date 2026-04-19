import type { TodoExtensionState } from "../model/types.js";

/**
 * Creates the mutable runtime state for the todo extension.
 *
 * @returns Fresh todo extension state.
 */
export function createTodoExtensionState(): TodoExtensionState {
	return {
		overlayHandle: null,
		finish: null,
		activeCwd: null,
	};
}
