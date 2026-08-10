import type { SharedModalHotkey } from "@nexus/tui-kit/modal/index";
import { createHotkeysFilterFooterHotkeys } from "./createHotkeysFilterFooterHotkeys";
import { createHotkeysFooterHotkeys } from "./createHotkeysFooterHotkeys";

export type HotkeysModalFooterState = {
  footerHotkeys: SharedModalHotkey[];
  footerLines: string[];
};

/**
 * Creates structured footer state for hotkeys modal status and navigation modes.
 *
 * @param pendingConflict Whether conflict approval is active.
 * @param editingEntryId Keybinding currently being edited.
 * @param statusMessage Latest status message.
 * @param filterActive Whether filter mode is active.
 * @param filterQuery Current filter query.
 * @param scrollOffset Current scroll offset.
 * @param maxScroll Maximum scroll offset.
 * @returns Structured footer hotkeys and text lines.
 */
export function createHotkeysModalFooterState(
  pendingConflict: boolean,
  editingEntryId: string | undefined,
  statusMessage: string,
  filterActive: boolean,
  filterQuery: string,
  scrollOffset: number,
  maxScroll: number,
): HotkeysModalFooterState {
  if (pendingConflict) return { footerHotkeys: [], footerLines: ["Conflict approval required"] };
  if (editingEntryId) return { footerHotkeys: [], footerLines: [`Editing ${editingEntryId}: press the replacement key`] };
  if (statusMessage) return { footerHotkeys: [], footerLines: [statusMessage] };
  if (filterActive) return { footerHotkeys: createHotkeysFilterFooterHotkeys(), footerLines: [`Filter: ${filterQuery || "type keys or labels"}`] };
  return { footerHotkeys: createHotkeysFooterHotkeys(scrollOffset, maxScroll), footerLines: [] };
}
