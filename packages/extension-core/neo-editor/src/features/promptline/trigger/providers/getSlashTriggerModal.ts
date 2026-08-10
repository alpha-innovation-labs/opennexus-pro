import type { TriggerModalState } from "../types";
import type { SlashMenuModal } from "@extensions/slash-menu/SlashMenuModal";

/**
 * Returns the active `/` modal instance.
 *
 * @param modalState Shared modal state.
 * @returns Active `/` modal.
 */
export function getSlashTriggerModal(modalState: TriggerModalState): SlashMenuModal | undefined {
  return modalState.slashModal;
}
