import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SharedModal, type SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { padVisible } from "../help-shortcuts/padVisible.js";
import { arrangeWhichKeyGroups } from "./arrangeWhichKeyGroups.js";
import { clampWhichKeyScrollOffset } from "./clampWhichKeyScrollOffset.js";
import { filterWhichKeyGroups } from "./filterWhichKeyGroups.js";
import { getWhichKeyFooterText } from "./getWhichKeyFooterText.js";
import { getWhichKeyGroups } from "./getWhichKeyGroups.js";
import { getWhichKeyFilterToken } from "./getWhichKeyFilterToken.js";
import { getWhichKeyScrollTarget } from "./getWhichKeyScrollTarget.js";
import { getWhichKeyVisibleLineCount } from "./getWhichKeyVisibleLineCount.js";
import { renderWhichKeyColumn } from "./renderWhichKeyColumn.js";
import type { WhichKeyExtensionShortcut, WhichKeyKeybindings } from "./types.js";

/**
 * Which-key style modal showing Nexus triggers, Pi keybindings, and extension shortcuts.
 */
export class WhichKeyModal extends SharedModal {
  focused = true;
  private readonly closeModal: () => void;
  private filterActive = false;
  private filterQuery = "";
  private pendingGoToTop = false;
  private scrollOffset = 0;
  private scrollTarget: "top" | "bottom" | undefined;

  constructor(
    private readonly uiTheme: SelectPreviewTheme,
    private readonly keybindings: WhichKeyKeybindings,
    private readonly extensionShortcuts: WhichKeyExtensionShortcut[],
    onClose: () => void,
  ) {
    super({ theme: uiTheme, minWidth: 72, maxWidthRatio: 1, fullScreen: true, fullScreenRows: () => process.stdout.rows || 40, onClose, headerLines: [uiTheme.fg("accent", "● Hotkeys")], panes: [] });
    this.closeModal = onClose;
  }

  /**
   * Handles close, scroll, and filter shortcuts for the modal.
   *
   * @param data Raw terminal input.
   */
  handleInput(data: string): void {
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
      this.pendingGoToTop = false;
      this.scrollOffset = 0;
      return;
    }
    const scrollTarget = getWhichKeyScrollTarget(data, this.pendingGoToTop);
    this.pendingGoToTop = scrollTarget.pendingGo;
    if (scrollTarget.target) {
      this.scrollTarget = scrollTarget.target;
      return;
    }
    if (data === "j" || matchesKey(data, Key.down)) this.scrollOffset += 1;
    if (data === "k" || matchesKey(data, Key.up)) this.scrollOffset -= 1;
  }

  /**
   * Handles key input while filter mode is active.
   *
   * @param data Raw terminal input.
   */
  private handleFilterInput(data: string): void {
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.enter)) {
      this.filterActive = false;
      return;
    }
    if (data === "\u007f" || matchesKey(data, Key.backspace)) {
      this.filterQuery = this.filterQuery.slice(0, -1);
      this.scrollOffset = 0;
      return;
    }
    const filterToken = getWhichKeyFilterToken(data);
    if (!filterToken) return;
    this.filterQuery = data.length === 1 && data >= " " ? this.filterQuery + filterToken : filterToken;
    this.scrollOffset = 0;
  }

  /**
   * Sets the filter query for tests and controlled callers.
   *
   * @param query Filter query.
   */
  setFilterQuery(query: string): void {
    this.filterActive = true;
    this.filterQuery = query;
    this.scrollOffset = 0;
  }

  /**
   * Returns the editor text that mirrors current hotkeys filter state.
   *
   * @returns Editor text while filtering, otherwise empty text.
   */
  getEditorMirrorText(): string {
    return this.filterActive ? `/${this.filterQuery}` : "";
  }

  /**
   * Renders grouped shortcut panels.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const dialogWidth = Math.max(1, width - 2);
    const gap = 2;
    const columnWidth = Math.floor((dialogWidth - gap) / 2);
    const groups = filterWhichKeyGroups(getWhichKeyGroups(this.keybindings, this.extensionShortcuts), this.filterQuery);
    const [leftGroups, rightGroups] = arrangeWhichKeyGroups(groups);
    const leftLines = renderWhichKeyColumn(this.uiTheme, leftGroups, columnWidth);
    const rightLines = renderWhichKeyColumn(this.uiTheme, rightGroups, dialogWidth - columnWidth - gap);
    const height = Math.max(leftLines.length, rightLines.length);
    const lines: string[] = [];
    for (let index = 0; index < height; index += 1) {
      lines.push(padVisible(leftLines[index] ?? "", columnWidth) + " ".repeat(gap) + padVisible(rightLines[index] ?? "", dialogWidth - columnWidth - gap));
    }
    if (groups.length === 0) lines.push(this.uiTheme.fg("dim", "No matching keybindings"));
    const visibleLineCount = getWhichKeyVisibleLineCount(process.stdout.rows || 40, 1, 1);
    const maxScroll = Math.max(0, lines.length - visibleLineCount);
    if (this.scrollTarget === "top") this.scrollOffset = 0;
    if (this.scrollTarget === "bottom") this.scrollOffset = maxScroll;
    this.scrollTarget = undefined;
    this.scrollOffset = clampWhichKeyScrollOffset(this.scrollOffset, lines.length, visibleLineCount);
    this.footerLines = [this.uiTheme.fg("dim", getWhichKeyFooterText(this.filterActive, this.filterQuery, this.scrollOffset, maxScroll))];
    const visibleLines = lines.slice(this.scrollOffset, this.scrollOffset + visibleLineCount);
    this.panes = [{ id: "which-key", size: 1, lines: visibleLines }];
    return super.render(width);
  }
}
