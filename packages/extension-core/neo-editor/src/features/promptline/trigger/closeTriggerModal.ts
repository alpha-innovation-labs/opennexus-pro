import { clearTriggerSession } from "./sessionState";
import type { TriggerModalState } from "./types";

/**
 * Closes any active trigger modal and clears modal state.
 *
 * @param state Mutable modal state.
 * @param requestRender Render callback.
 */
export function closeTriggerModal(
	state: TriggerModalState,
	requestRender: () => void,
): void {
	clearTriggerSession();
	state.handle?.hide();
	state.handle = undefined;
	state.atModal = undefined;
	state.slashModal = undefined;
	state.abort?.abort();
	state.abort = undefined;
	requestRender();
}
