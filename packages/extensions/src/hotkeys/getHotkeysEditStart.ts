import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysEntry } from "./types.js";

export type HotkeysEditStart = {
  editingEntryId?: string;
  focusedEntryId?: string;
  statusMessage: string;
};

/**
 * Resolves the focused entry that should enter key-capture edit mode.
 *
 * @param entries Editable entries in display order.
 * @param focusedEntryId Current focused keybinding id.
 * @returns Edit state update for the selected entry.
 */
export function getHotkeysEditStart(entries: HotkeysEntry[], focusedEntryId: string | undefined): HotkeysEditStart {
  const entry = entries.find((candidate) => getHotkeysEntryFocusId(candidate) === focusedEntryId) ?? entries[0];
  if (!entry?.keybindingId) return { statusMessage: "No editable keybinding selected" };
  return { editingEntryId: entry.keybindingId, focusedEntryId: entry.keybindingId, statusMessage: `Press a key to bind ${entry.label}` };
}
