import type { TodoExtensionState } from "../model/types.js";

/**
 * Closes the active todo overlay.
 *
 * @param state Todo runtime state.
 */
export function closeTodoModal(state: TodoExtensionState): void {
	const finish = state.finish;
	state.overlayHandle?.hide();
	state.overlayHandle = null;
	state.finish = null;
	state.activeCwd = null;
	finish?.();
}
