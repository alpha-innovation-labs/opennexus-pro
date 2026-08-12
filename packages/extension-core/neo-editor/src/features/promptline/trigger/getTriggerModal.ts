import type { SlashMenuModal } from "@extensions/slash-menu";
import type { AtModal } from "../AtModal";
import { getTriggerProvider } from "./getTriggerProvider";
import type { TriggerKind, TriggerModalState } from "./types";

/**
 * Returns the active modal instance for one trigger kind.
 *
 * @param modalState Shared trigger modal state.
 * @param kind Trigger kind.
 * @returns Matching modal instance.
 */
export function getTriggerModal(
	modalState: TriggerModalState,
	kind: "at",
): AtModal | undefined;
export function getTriggerModal(
	modalState: TriggerModalState,
	kind: "slash",
): SlashMenuModal | undefined;
export function getTriggerModal(
	modalState: TriggerModalState,
	kind: TriggerKind,
): AtModal | SlashMenuModal | undefined;
export function getTriggerModal(
	modalState: TriggerModalState,
	kind: TriggerKind,
) {
	return getTriggerProvider(kind).getModal(modalState);
}
