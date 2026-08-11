import type { AtModal } from "../../AtModal";
import type { TriggerModalState } from "../types";

/**
 * Returns the active `@` modal instance.
 *
 * @param modalState Shared modal state.
 * @returns Active `@` modal.
 */
export function getAtTriggerModal(
	modalState: TriggerModalState,
): AtModal | undefined {
	return modalState.atModal;
}
