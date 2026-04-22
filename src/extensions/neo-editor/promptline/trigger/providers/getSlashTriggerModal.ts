import type { TriggerModalState } from "../types.js";
import type { SlashMenuModal } from "../../../../shared/slash-menu/SlashMenuModal.js";

/**
 * Returns the active `/` modal instance.
 *
 * @param modalState Shared modal state.
 * @returns Active `/` modal.
 */
export function getSlashTriggerModal(modalState: TriggerModalState): SlashMenuModal | undefined {
  return modalState.slashModal;
}
