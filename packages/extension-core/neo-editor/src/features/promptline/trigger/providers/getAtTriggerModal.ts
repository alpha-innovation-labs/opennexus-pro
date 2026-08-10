import type { TriggerModalState } from "../types";
import type { AtModal } from "../../AtModal";

/**
 * Returns the active `@` modal instance.
 *
 * @param modalState Shared modal state.
 * @returns Active `@` modal.
 */
export function getAtTriggerModal(modalState: TriggerModalState): AtModal | undefined {
  return modalState.atModal;
}
