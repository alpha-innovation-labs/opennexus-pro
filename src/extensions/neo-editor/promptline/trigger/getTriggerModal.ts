import { getTriggerProvider } from "./getTriggerProvider.js";
import type { TriggerKind, TriggerModalState } from "./types.js";
import type { AtModal } from "../AtModal.js";
import type { SlashMenuModal } from "../../../shared/slash-menu/SlashMenuModal.js";

/**
 * Returns the active modal instance for one trigger kind.
 *
 * @param modalState Shared trigger modal state.
 * @param kind Trigger kind.
 * @returns Matching modal instance.
 */
export function getTriggerModal(modalState: TriggerModalState, kind: "at"): AtModal | undefined;
export function getTriggerModal(modalState: TriggerModalState, kind: "slash"): SlashMenuModal | undefined;
export function getTriggerModal(modalState: TriggerModalState, kind: TriggerKind) {
  return getTriggerProvider(kind).getModal(modalState);
}
