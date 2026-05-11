import { Key, matchesKey, parseKey } from "@earendil-works/pi-tui";
import { applyHotkeysFilterInput } from "./applyHotkeysFilterInput.js";
import { SharedModal, type SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { clampHotkeysScrollOffset } from "./clampHotkeysScrollOffset.js";
import { filterHotkeysGroups } from "./filterHotkeysGroups.js";
import { getNextHotkeysFocus } from "./getNextHotkeysFocus.js";
import { getHotkeysEditableEntries } from "./getHotkeysEditableEntries.js";
import { getHotkeysFocusableEntries } from "./getHotkeysFocusableEntries.js";
import { getHotkeysEditStart } from "./getHotkeysEditStart.js";
import { getHotkeysConflict } from "./getHotkeysConflict.js";
import { createHotkeysModalFooterState } from "./createHotkeysModalFooterState.js";
import { getHotkeysGroups } from "./getHotkeysGroups.js";
import { getHotkeysScrollTarget } from "./getHotkeysScrollTarget.js";
import { getHotkeysVisibleLineCount } from "./getHotkeysVisibleLineCount.js";
import { renderHotkeysLines } from "./renderHotkeysLines.js";
import { renderHotkeysConflictModal } from "./renderHotkeysConflictModal.js";
import { resolveHotkeysFocus } from "./resolveHotkeysFocus.js";
import { resolveHotkeysPaneFocus } from "./resolveHotkeysPaneFocus.js";
import { saveHotkeysBinding } from "./saveHotkeysBinding.js";
import type { PendingHotkeysConflict, HotkeysExtensionShortcut, HotkeysKeybindings } from "./types.js";

export class HotkeysModal extends SharedModal {
  focused = true;
  private readonly closeModal: () => void;
  private filterActive = false;
  private filterQuery = "";
  private editingEntryId: string | undefined;
  private focusedEntryId: string | undefined;
  private pendingConflict: PendingHotkeysConflict | undefined;
  private statusMessage = "";
  private pendingGoToTop = false;
  private scrollOffset = 0;
  private scrollTarget: "top" | "bottom" | undefined;

  constructor(private readonly uiTheme: SelectPreviewTheme, private readonly keybindings: HotkeysKeybindings, private readonly extensionShortcuts: HotkeysExtensionShortcut[], onClose: () => void) {
    super({ theme: uiTheme, minWidth: 72, maxWidthRatio: 1, fullScreen: true, fullScreenRows: () => process.stdout.rows || 40, onClose, headerLines: [uiTheme.fg("accent", "● Hotkeys")], panes: [] });
    this.closeModal = onClose;
  }

  /** Handles close, scroll, and filter shortcuts for the modal. */
  handleInput(data: string): void {
    if (this.pendingConflict) {
      this.handleConflictInput(data);
      return;
    }
    if (this.editingEntryId) {
      this.handleEditInput(data);
      return;
    }
    if (matchesKey(data, Key.ctrl("c")) || data === "?") {
      this.closeModal();
      return;
    }
    if (this.filterActive) {
      this.handleFilterInput(data);
      return;
    }
    if (matchesKey(data, Key.escape) || data === "q") {
      this.closeModal();
      return;
    }
    if (data === "/") {
      this.filterActive = true;
      this.filterQuery = "";
      this.statusMessage = "";
      this.pendingGoToTop = false;
      this.scrollOffset = 0;
      return;
    }
    if (matchesKey(data, Key.enter)) {
      this.startEditingFirstMatch();
      return;
    }
    const scrollTarget = getHotkeysScrollTarget(data, this.pendingGoToTop);
    this.pendingGoToTop = scrollTarget.pendingGo;
    if (scrollTarget.target) {
      this.scrollTarget = scrollTarget.target;
      return;
    }
    if (data === "l") this.movePaneFocus(1);
    if (data === "h") this.movePaneFocus(-1);
    if (data === "j" || matchesKey(data, Key.down)) this.moveFocus(1);
    if (data === "k" || matchesKey(data, Key.up)) this.moveFocus(-1);
  }

  /** Handles key input while filter mode is active. */
  private handleFilterInput(data: string): void {
    const result = applyHotkeysFilterInput(data, this.filterQuery);
    if (result.action === "edit") {
      this.startEditingFirstMatch();
      return;
    }
    if (result.filterActive !== undefined) this.filterActive = result.filterActive;
    this.filterQuery = result.filterQuery;
    this.scrollOffset = result.scrollOffset;
    this.statusMessage = result.statusMessage;
  }

  /** Moves focus through hotkey rows. */
  private moveFocus(direction: -1 | 1): void {
    const entries = getHotkeysEditableEntries(this.keybindings, this.extensionShortcuts, this.filterQuery);
    this.focusedEntryId = getNextHotkeysFocus(entries, resolveHotkeysFocus(entries, this.focusedEntryId), direction);
    this.statusMessage = "";
  }

  /** Moves focus between hotkey panes. */
  private movePaneFocus(direction: -1 | 1): void {
    const groups = filterHotkeysGroups(getHotkeysGroups(this.keybindings, this.extensionShortcuts), this.filterQuery);
    this.focusedEntryId = resolveHotkeysPaneFocus(groups, this.focusedEntryId, direction);
    this.statusMessage = "";
  }

  /** Starts editing the focused editable entry in the current filtered view. */
  private startEditingFirstMatch(): void {
    const entries = getHotkeysFocusableEntries(this.keybindings, this.extensionShortcuts, this.filterQuery);
    const editStart = getHotkeysEditStart(entries, resolveHotkeysFocus(entries, this.focusedEntryId));
    this.focusedEntryId = editStart.focusedEntryId;
    this.editingEntryId = editStart.editingEntryId;
    this.statusMessage = editStart.statusMessage;
  }

  /** Captures a replacement key and persists it for the active editing entry. */
  private handleEditInput(data: string): void {
    const key = parseKey(data);
    if (!key || !this.editingEntryId) return;
    if (matchesKey(data, Key.escape)) {
      this.editingEntryId = undefined;
      this.pendingConflict = undefined;
      this.statusMessage = "Hotkey edit cancelled";
      return;
    }
    const keybindingId = this.editingEntryId;
    const conflictingIds = getHotkeysConflict(this.keybindings, keybindingId, key);
    if (conflictingIds.length > 0) {
      this.pendingConflict = { keybindingId, key, conflictingIds };
      return;
    }
    this.saveEditedKeybinding(keybindingId, key);
  }

  /** Saves the captured key and exits editing mode. */
  private saveEditedKeybinding(keybindingId: string, key: string, overriddenKeybindingIds: string[] = []): void {
    const configPath = saveHotkeysBinding(this.keybindings, keybindingId, key, overriddenKeybindingIds);
    this.editingEntryId = undefined;
    this.pendingConflict = undefined;
    this.filterActive = false;
    this.focusedEntryId = keybindingId;
    this.statusMessage = configPath ? `Saved ${keybindingId} = ${key}` : `Updated ${keybindingId} = ${key}`;
  }

  /** Handles approval or cancellation for a conflicting replacement key. */
  private handleConflictInput(data: string): void {
    if (matchesKey(data, Key.enter) || data === "y") {
      const conflict = this.pendingConflict;
      if (!conflict) return;
      this.saveEditedKeybinding(conflict.keybindingId, conflict.key, conflict.conflictingIds);
      return;
    }
    if (matchesKey(data, Key.escape) || data === "n" || matchesKey(data, Key.ctrl("c"))) {
      this.pendingConflict = undefined;
      this.statusMessage = "Conflict override cancelled";
    }
  }

  /** Sets the filter query for tests and controlled callers. */
  setFilterQuery(query: string): void {
    this.filterActive = true;
    this.filterQuery = query;
    this.focusedEntryId = undefined;
    this.statusMessage = "";
    this.scrollOffset = 0;
  }

  /** Returns the editor text that mirrors current hotkeys filter state. */
  getEditorMirrorText(): string {
    return this.filterActive ? `/${this.filterQuery}` : "";
  }

  /** Renders grouped shortcut panels. */
  render(width: number): string[] {
    const dialogWidth = Math.max(1, width - 2);
    const groups = filterHotkeysGroups(getHotkeysGroups(this.keybindings, this.extensionShortcuts), this.filterQuery);
    const focusEntries = this.focusedEntryId ? getHotkeysFocusableEntries(this.keybindings, this.extensionShortcuts, this.filterQuery) : getHotkeysEditableEntries(this.keybindings, this.extensionShortcuts, this.filterQuery);
    this.focusedEntryId = resolveHotkeysFocus(focusEntries, this.focusedEntryId);
    const lines = renderHotkeysLines(this.uiTheme, groups, dialogWidth, this.focusedEntryId, this.editingEntryId);
    if (this.pendingConflict) lines.unshift(...renderHotkeysConflictModal(this.uiTheme, this.pendingConflict, dialogWidth));
    const visibleLineCount = getHotkeysVisibleLineCount(process.stdout.rows || 40, 1, 1);
    const maxScroll = Math.max(0, lines.length - visibleLineCount);
    if (this.scrollTarget === "top") this.scrollOffset = 0;
    if (this.scrollTarget === "bottom") this.scrollOffset = maxScroll;
    this.scrollTarget = undefined;
    this.scrollOffset = clampHotkeysScrollOffset(this.scrollOffset, lines.length, visibleLineCount);
    const footerState = createHotkeysModalFooterState(Boolean(this.pendingConflict), this.editingEntryId, this.statusMessage, this.filterActive, this.filterQuery, this.scrollOffset, maxScroll);
    this.footerHotkeys = footerState.footerHotkeys;
    this.footerLines = footerState.footerLines.map((line) => this.uiTheme.fg("dim", line));
    const visibleLines = lines.slice(this.scrollOffset, this.scrollOffset + visibleLineCount);
    this.panes = [{ id: "hotkeys", size: 1, lines: visibleLines }];
    return super.render(width);
  }
}
